from flask import Flask, render_template, jsonify, request
import base64
import json, requests

app = Flask(__name__)

CLIENT_ID = "yAxzQRFX97vOcyQAwluEU6H6ePxMA5eY"
CLIENT_SECRET = "4dY0PjEYqoBrZ99r"
API_KEY = "eUF4elFSRlg5N3ZPY3lRQXdsdUVVNkg2ZVB4TUE1ZVk6YVc1MlpYTjBaV04wWlcxRmRHaGpHUkJ0WVdOamIzVnVaSE50WTJGdVkwdDJlQT09"

AUTH_URL = "https://openapisandbox.investec.com/identity/v2/oauth2/token"
BASE_URL = "https://openapisandbox.investec.com"

def get_access_token():
    auth_string = f"{CLIENT_ID}:{CLIENT_SECRET}"
    auth_bytes = auth_string.encode("ascii")
    base64_auth = base64.b64encode(auth_bytes).decode("ascii")

    headers = {
        "Authorization": f"Basic {base64_auth}",
        "x-api-key": API_KEY,
        "Content-Type": "application/x-www-form-urlencoded",
        "Accept": "application/json"
    }

    data = {"grant_type": "client_credentials"}

    response = requests.post(AUTH_URL, headers=headers, data=data)
    response.raise_for_status()
    token_data = response.json()
    return token_data["access_token"]

def call_sandbox_api(endpoint, token):
    url = f"{BASE_URL}{endpoint}"
    headers = {
        "Authorization": f"Bearer {token}",
        "x-api-key": API_KEY,
        "Accept": "application/json"
    }

    response = requests.get(url, headers=headers)
    response.raise_for_status()
    return response.json()

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/api/accounts")
def get_accounts():
    try:
        token = get_access_token()
        accounts = call_sandbox_api("/za/pb/v1/accounts", token)
        return jsonify(accounts)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/balance/<account_id>")
def get_balance(account_id):
    try:
        token = get_access_token()
        balance = call_sandbox_api(f"/za/pb/v1/accounts/{account_id}/balance", token)
        return jsonify(balance)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/beneficiaries")
def get_beneficiaries():
    try:
        token = get_access_token()
        beneficiaries = call_sandbox_api("/za/pb/v1/accounts/beneficiaries", token)
        return jsonify(beneficiaries)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/beneficiary-categories")
def get_beneficiary_categories():
    try:
        token = get_access_token()
        categories = call_sandbox_api("/za/pb/v1/accounts/beneficiarycategories", token)
        print(categories)
        return jsonify(categories)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/documents", methods=["GET"])
def get_documents():
    account_id = request.args.get("accountId")
    from_date = request.args.get("fromDate")
    to_date   = request.args.get("toDate")
    if not account_id or not from_date or not to_date:
        return jsonify({"error": "accountId, fromDate, toDate are required"}), 400

    token = get_access_token()
    url = f"{BASE_URL}/za/pb/v1/accounts/{account_id}/documents?fromDate={from_date}&toDate={to_date}"
    headers = {"Authorization": f"Bearer {token}", "x-api-key": API_KEY, "Accept": "application/json"}
    resp = requests.get(url, headers=headers, timeout=30)
    return (jsonify(resp.json()), resp.status_code)

@app.route("/api/health")
def api_health():
    return jsonify({"ok": True}), 200

@app.route("/api/routes")
def api_routes():
    routes = []
    for rule in app.url_map.iter_rules():
        routes.append({"rule": str(rule), "methods": sorted(m for m in rule.methods if m not in ("HEAD","OPTIONS"))})
    return jsonify(sorted(routes, key=lambda r: r["rule"]))

@app.route("/api/accounts/<account_id>/transactions", methods=["GET"])
def get_transactions(account_id):
    """
    Fetch transactions for a given account.
    """
    try:
        token = get_access_token()
        headers = {
            "Authorization": f"Bearer {token}",
            "x-api-key": API_KEY,
            "Accept": "application/json"
        }
        url = f"{BASE_URL}/za/pb/v1/accounts/{account_id}/transactions"
        # --- NEW: build params / support "all=true" and paginate ---
        from datetime import date

        all_flag = str(request.args.get("all", "")).lower() in ("1", "true", "yes")

        # If "all=true", fetch a very broad range that covers sandbox data (and prod history)
        if all_flag:
            base_params = {
                "fromDate": "1900-01-01",
                "toDate": date.today().isoformat(),
            }
        else:
            # otherwise respect whatever the UI passed (or nothing = API's default window)
            base_params = {}
            fd = request.args.get("fromDate")
            td = request.args.get("toDate")
            tx_type = request.args.get("transactionType")
            include_p = request.args.get("includePending")
            if fd: base_params["fromDate"] = fd
            if td: base_params["toDate"] = td
            if tx_type: base_params["transactionType"] = tx_type
            if include_p: base_params["includePending"] = include_p

        # Pull all pages
        page = 1
        all_tx = []
        last_meta = {}
        while True:
            params = {**base_params, "page": page}
            resp = requests.get(url, headers=headers, params=params, timeout=30)
            try:
                payload = resp.json()
            except Exception:
                return jsonify({"status": resp.status_code, "text": resp.text}), resp.status_code

            tx = (payload.get("data", {}) or {}).get("transactions", []) or payload.get("transactions", [])
            meta = payload.get("meta", {})
            total_pages = int(meta.get("totalPages", 1) or 1)

            all_tx.extend(tx)
            last_meta = meta

            if page >= total_pages:
                break
            page += 1

        return jsonify({"data": {"transactions": all_tx}, "meta": last_meta}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# POST /api/pay-multiple  -> Investec: POST /za/pb/v1/accounts/{accountId}/paymultiple
@app.route("/api/pay-multiple", methods=["POST"])
def pay_multiple():
    try:
        body = request.get_json(force=True) or {}
        account_id = body.get("accountId")
        payment_list = body.get("paymentList", [])
        if not account_id or not payment_list:
            return jsonify({"error": "accountId and paymentList are required"}), 400

        token = get_access_token()
        headers = {
            "Authorization": f"Bearer {token}",
            "x-api-key": API_KEY,
            "Accept": "application/json",
            "Content-Type": "application/json",
        }
        url = f"{BASE_URL}/za/pb/v1/accounts/{account_id}/paymultiple"
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

        token = get_access_token()
        headers = {
            "Authorization": f"Bearer {token}",
            "x-api-key": API_KEY,
            "Accept": "application/json",
            "Content-Type": "application/json",
        }

        # Investec sandbox: POST /za/pb/v1/accounts/{accountId}/transfermultiple
        # Payload shape uses 'transferList'
        url = f"{BASE_URL}/za/pb/v1/accounts/{from_id}/transfermultiple"
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

