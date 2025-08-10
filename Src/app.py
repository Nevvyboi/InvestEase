from flask import Flask, render_template, jsonify, request
import base64
import json, requests

app = Flask(__name__)

clientId = "yAxzQRFX97vOcyQAwluEU6H6ePxMA5eY"
clientSecret = "4dY0PjEYqoBrZ99r"
apiKey = "eUF4elFSRlg5N3ZPY3lRQXdsdUVVNkg2ZVB4TUE1ZVk6YVc1MlpYTjBaV04wWlcxRmRHaGpHUkJ0WVdOamIzVnVaSE50WTJGdVkwdDJlQT09"

authUrl = "https://openapisandbox.investec.com/identity/v2/oauth2/token"
baseUrl = "https://openapisandbox.investec.com"

def getAccessToken():
    authString = f"{clientId}:{clientSecret}"
    authBytes = authString.encode("ascii")
    base64Auth = base64.b64encode(authBytes).decode("ascii")

    headers = {
        "Authorization": f"Basic {base64Auth}",
        "x-api-key": apiKey,
        "Content-Type": "application/x-www-form-urlencoded",
        "Accept": "application/json"
    }

    data = {
        "grant_type": "client_credentials"
    }

    response = requests.post(authUrl, headers = headers, data = data)
    response.raise_for_status()
    tokenData = response.json()
    return tokenData["access_token"]

def callSandboxApi(endpoint, token):
    url = f"{baseUrl}{endpoint}"
    headers = {
        "Authorization": f"Bearer {token}",
        "x-api-key": apiKey,
        "Accept": "application/json"
    }

    response = requests.get(url, headers = headers)
    response.raise_for_status()
    return response.json()

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/api/accounts")
def getAccounts():
    try:
        token = getAccessToken()
        accounts = callSandboxApi("/za/pb/v1/accounts", token)
        return jsonify(accounts)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/balance/<accountId>")
def getBalance(accountId):
    try:
        token = getAccessToken()
        balance = callSandboxApi(f"/za/pb/v1/accounts/{accountId}/balance", token)
        return jsonify(balance)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/beneficiaries")
def getBeneficiaries():
    try:
        token = getAccessToken()
        beneficiaries = callSandboxApi("/za/pb/v1/accounts/beneficiaries", token)
        return jsonify(beneficiaries)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/beneficiary-categories")
def getBeneficiaryCategories():
    try:
        token = getAccessToken()
        categories = callSandboxApi("/za/pb/v1/accounts/beneficiarycategories", token)
        return jsonify(categories)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/documents", methods=["GET"])
def getDocuments():
    accountId = request.args.get("accountId")
    fromDate = request.args.get("fromDate")
    to_date   = request.args.get("toDate")
    if not accountId or not fromDate or not to_date:
        return jsonify({"error": "accountId, fromDate, toDate are required"}), 400

    token = getAccessToken()
    url = f"{baseUrl}/za/pb/v1/accounts/{accountId}/documents?fromDate={fromDate}&toDate={to_date}"
    headers = {
        "Authorization": f"Bearer {token}",
        "x-api-key": apiKey,
        "Accept": "application/json"
    }
    resp = requests.get(url, headers = headers, timeout = 30)
    return (jsonify(resp.json()), resp.status_code)

@app.route("/api/health")
def apiHealth():
    return jsonify({"ok": True}), 200

@app.route("/api/routes")
def apiRoutes():
    routes = []
    for rule in app.url_map.iter_rules():
        routes.append({"rule": str(rule), "methods": sorted(m for m in rule.methods if m not in ("HEAD","OPTIONS"))})
    return jsonify(sorted(routes, key=lambda r: r["rule"]))

@app.route("/api/accounts/<accountId>/transactions", methods=["GET"])
def getTransactions(accountId):
    try:
        token = getAccessToken()
        headers = {
            "Authorization": f"Bearer {token}",
            "x-api-key": apiKey,
            "Accept": "application/json"
        }
        url = f"{baseUrl}/za/pb/v1/accounts/{accountId}/transactions"
        from datetime import date
        allFlag = str(request.args.get("all", "")).lower() in ("1", "true", "yes")
        if allFlag:
            baseParams = {
                "fromDate": "1900-01-01",
                "toDate": date.today().isoformat(),
            }
        else:
            baseParams = {}
            fd = request.args.get("fromDate")
            td = request.args.get("toDate")
            txType = request.args.get("transactionType")
            includeP = request.args.get("includePending")
            if fd: baseParams["fromDate"] = fd
            if td: baseParams["toDate"] = td
            if txType: baseParams["transactionType"] = txType
            if includeP: baseParams["includePending"] = includeP

        page = 1
        allTx = []
        lastMeta = {}
        while True:
            params = {**baseParams, "page": page}
            resp = requests.get(url, headers = headers, params = params, timeout = 30)
            try:
                payload = resp.json()
            except Exception:
                return jsonify({"status": resp.status_code, "text": resp.text}), resp.status_code

            tx = (payload.get("data", {}) or {}).get("transactions", []) or payload.get("transactions", [])
            meta = payload.get("meta", {})
            totalPages = int(meta.get("totalPages", 1) or 1)

            allTx.extend(tx)
            lastMeta = meta

            if page >= totalPages:
                break
            page += 1

        return jsonify({"data": {"transactions": allTx}, "meta": lastMeta}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug = True)

