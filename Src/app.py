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
        "x-api-key": ,
        "Content-Type": "application/x-www-form-urlencoded",
        "Accept": "application/json"
    }

    data = {
        "grant_type": "client_credentials"
    }

    response = requests.post(authUrl, headers=headers, data=data)
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

    response = requests.get(url, headers=headers)
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

@app.route("/api/balance/<account_id>")
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

@app.route("/api/accounts/<account_id>/transactions", methods=["GET"])
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
            resp = requests.get(url, headers=headers, params=params, timeout=30)
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

@app.route("/api/pay-multiple", methods=["POST"])
def pay_multiple():
    try:
        body = request.get_json(force=True) or {}
        account_id = body.get("accountId")
        payment_list = body.get("paymentList", [])
        if not account_id or not payment_list:
            return jsonify({"error": "accountId and paymentList are required"}), 400

        token = getAccessToken()
        headers = {
            "Authorization": f"Bearer {token}",
            "x-api-key": apiKey,
            "Accept": "application/json",
            "Content-Type": "application/json",
        }
        url = f"{baseUrl}/za/pb/v1/accounts/{account_id}/paymultiple"
        r = requests.post(url, headers=headers, json={"paymentList": payment_list}, timeout=30)
        try:
            body = r.json()
        except Exception:
            body = {"raw": r.text}
        return jsonify(body), r.status_code
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/transfer", methods=["POST"])
def own_transfer():
    """
    Transfer between user's own accounts (sandbox proxy).
    Expected JSON body:
    {
      "fromAccountId": "...",
      "toAccountId": "...",
      "amount": 50.00,
      "myReference": "Move funds",
      "theirReference": "From Cheque"
    }
    """
    try:
        body = request.get_json(force=True) or {}
        from_id = str(body.get("fromAccountId") or "").strip()
        to_id   = str(body.get("toAccountId") or "").strip()
        amount  = body.get("amount")
        my_ref  = str(body.get("myReference") or "")
        their_ref = str(body.get("theirReference") or "")

        # Accept legacy shape (accountId + transferList) too
        if (not from_id or not to_id or amount is None) and body.get("accountId") and body.get("transferList"):
            try:
                legacy_from = str(body.get("accountId"))
                first = (body.get("transferList") or [{}])[0]
                legacy_to = str(first.get("toAccountId") or first.get("accountId") or "")
                legacy_amount = first.get("amount")
                legacy_my = str(first.get("myReference") or "")
                legacy_their = str(first.get("theirReference") or "")
                if legacy_from and legacy_to and legacy_amount is not None:
                    from_id, to_id, amount = legacy_from, legacy_to, legacy_amount
                    my_ref = my_ref or legacy_my
                    their_ref = their_ref or legacy_their
            except Exception:
                pass
    
        if not from_id or not to_id or amount is None:
            return jsonify({"error": "fromAccountId, toAccountId and amount are required"}), 400

        token = getAccessToken()
        headers = {
            "Authorization": f"Bearer {token}",
            "x-api-key": apiKey,
            "Accept": "application/json",
            "Content-Type": "application/json",
        }

        # Investec sandbox: POST /za/pb/v1/accounts/{accountId}/transfermultiple
        # Payload shape uses 'transferList'
        url = f"{baseUrl}/za/pb/v1/accounts/{from_id}/transfermultiple"
        payload = {
            "transferList": [{
                "toAccountId": to_id,
                "amount": float(amount),
                "myReference": my_ref[:20],
                "theirReference": their_ref[:20]
            }]
        }
        r = requests.post(url, headers=headers, json=payload, timeout=30)
        try:
            data = r.json()
        except Exception:
            data = {"raw": r.text}
        return jsonify(data), r.status_code
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)

