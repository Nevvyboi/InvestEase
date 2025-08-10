# 💳 InvestEase — Modern Banking Dashboard

A sleek, responsive web app that connects to the **[Investec Sandbox API](https://developer.investec.com/za/api-products/documentation/SA_PB_Account_Information)** 🏦, letting you ->
📊 **View recent transactions** in style
🎨 **Enjoy a clean, animated, responsive UI**
⚡ **Navigate quickly** with an intuitive sidebar

---

## 🚀 Features (Sandbox-limited)

* **Dashboard** -> High-level view of accounts and activity
* **Accounts** -> See sandbox account balances and details
* **Transactions** -> Scrollable, formatted transaction list
* **Beneficiaries** -> Manage and view sandbox beneficiary data
* **Documents** -> Retrieve account-related sandbox documents

---

## 🛠 Tech Stack

* **Frontend:** HTML, CSS, JavaScript (Vanilla)
* **Backend:** Python (Flask)
* **API:** Investec OpenAPI Sandbox
* **Styling:** Custom responsive CSS + animations

---

## 🧰 Installation & Setup (no API credentials needed)

> 🚀 This project ships with a preconfigured Investec **Sandbox** client.  
> You can run it locally without setting any keys or secrets.

### 0️⃣ Make sure Python is installed 🐍
You’ll need **Python 3.8+** installed on your system.  
Check by running:

python --version
# or
python3 --version

### 1) Clone the repo

```bash
git clone https://github.com/yourusername/InvestEase.git
cd InvestEase
```

### 2) (Optional) Create & activate a virtual environment

```bash
# Windows (PowerShell)
python -m venv .venv
.venv\Scripts\Activate.ps1

# macOS/Linux
python3 -m venv .venv
source .venv/bin/activate
```

### 3) Install dependencies

```bash
pip install -r requirements.txt
```

### 4) Run the app

Use whichever command your setup prefers:

```bash
# Option A: Flask CLI
flask --app app run --debug

# Option B: Python entrypoint
python app.py
# or
python -m flask --app app run --debug
```

### 5) Open in your browser

```
http://127.0.0.1:5000/
```

---

## 🖼 Screenshots

<img width="1845" height="919" alt="{01408993-37D1-4616-846C-6799A7B5805B}" src="https://github.com/user-attachments/assets/9e58ac3b-adc9-433c-935d-a7e0da2dc0e5" />

<img width="1837" height="916" alt="{7429BAA2-D3C0-42AD-AB17-1B2A5DCBDE61}" src="https://github.com/user-attachments/assets/ab6c665a-1340-4187-93d6-599de0925846" />

<img width="1841" height="913" alt="{2D4AF8E8-8B0D-42B0-B085-654799C1AE01}" src="https://github.com/user-attachments/assets/6faba89b-e60d-4b21-804a-9755ea9bf944" />

<img width="1848" height="917" alt="{2A74872F-9DD2-463E-B1D9-76B5D41CA05F}" src="https://github.com/user-attachments/assets/165850d6-3071-4e9d-b835-94bdb86eacab" />

<img width="1840" height="915" alt="{A9B13E90-FF12-401E-877A-61CACD37F160}" src="https://github.com/user-attachments/assets/f63d8c03-19b1-43a1-ab3c-05b541c3244e" />

<img width="1835" height="913" alt="{ED45FECC-A887-418E-AF4C-635C527B5D29}" src="https://github.com/user-attachments/assets/a5153965-5817-41a0-a42b-e38da4084901" />

---

## 📜 License

MIT License — feel free to fork, modify, and share.

---

## 📜 Notes

⚠ **Important:** The Investec Sandbox API is **read-only** for most operations and contains only sample data. Some features (like real payments) are not functional in sandbox mode.

---


