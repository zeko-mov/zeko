import os
from flask import Flask, render_template_string, request, send_file
import openai
from io import BytesIO
import requests

app = Flask(__name__)

# مفتاح الـ API (استخدم متغير بيئة أو حطه مباشرة)
openai.api_key = os.getenv("OPENAI_API_KEY")
# لو عايز تحط المفتاح مباشرة (مش آمن) استخدم السطر ده:
openai.api_key = "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"

# قالب HTML مدمج
HTML_TEMPLATE = """
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <title>مولّد الصور بالذكاء الاصطناعي</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, sans-serif;
            background: #1e1e2f;
            color: #fff;
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 40px 20px;
            margin: 0;
            min-height: 100vh;
        }
        .container {
            background: #2a2a40;
            padding: 30px;
            border-radius: 20px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.5);
            width: 100%;
            max-width: 700px;
            text-align: center;
        }
        textarea {
            width: 100%;
            padding: 15px;
            border-radius: 12px;
            border: none;
            font-size: 16px;
            margin: 15px 0;
            background: #3a3a4e;
            color: white;
            resize: vertical;
            min-height: 100px;
        }
        button {
            background: #6c63ff;
            color: white;
            border: none;
            padding: 14px 28px;
            border-radius: 12px;
            font-size: 18px;
            cursor: pointer;
            transition: 0.3s;
        }
        button:hover {
            background: #5a52e0;
        }
        img {
            margin-top: 20px;
            max-width: 100%;
            border-radius: 12px;
            box-shadow: 0 0 20px rgba(108, 99, 255, 0.4);
        }
        .error {
            color: #ff6b6b;
            margin: 15px 0;
            font-weight: bold;
        }
        .download-btn {
            display: inline-block;
            margin-top: 15px;
            background: #2ecc71;
            padding: 10px 20px;
            border-radius: 8px;
            color: white;
            text-decoration: none;
            font-size: 16px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🎨 حول كلامك لصورة بالذكاء الاصطناعي</h1>
        <form method="POST">
            <textarea name="prompt" placeholder="اكتب وصف الصورة اللي في خيالك..."></textarea>
            <br>
            <button type="submit">✨ توليد الصورة</button>
        </form>

        {% if error %}
            <p class="error">{{ error }}</p>
        {% endif %}

        {% if image_url %}
            <img src="{{ image_url }}" alt="الصورة المُنتجة">
            <br>
            <a class="download-btn" href="/download?url={{ image_url }}" download>⬇️ تحميل الصورة</a>
        {% endif %}
    </div>
</body>
</html>
"""

@app.route("/", methods=["GET", "POST"])
def index():
    image_url = None
    error = None

    if request.method == "POST":
        prompt = request.form.get("prompt")
        if not prompt:
            error = "معلش، اكتب وصف للصورة الأول."
        else:
            try:
                response = openai.images.generate(
                    model="dall-e-3",
                    prompt=prompt,
                    size="1024x1024",
                    quality="standard",
                    n=1,
                )
                image_url = response.data[0].url
            except Exception as e:
                error = f"حصل مشكلة: {str(e)}"

    return render_template_string(HTML_TEMPLATE, image_url=image_url, error=error)

@app.route("/download")
def download():
    url = request.args.get("url")
    if not url:
        return "مفيش صورة", 404
    response = requests.get(url)
    return send_file(BytesIO(response.content), mimetype="image/png", as_attachment=True, download_name="ai_image.png")

if __name__ == "__main__":
    app.run(debug=True)