from flask import Flask, render_template, jsonify, send_file
from datetime import datetime
import os
import io

app = Flask(__name__)

ANNIVERSARY_DATE = "2026-01-24"


@app.route('/')
def index():
    return render_template('index.html', anniversary_date=ANNIVERSARY_DATE)


@app.route('/api/time-remaining')
def get_time_remaining():
    """API pour récupérer le temps restant jusqu'à l'anniversaire"""
    now = datetime.now()
    target = datetime.strptime(ANNIVERSARY_DATE, "%Y-%m-%d")

    if now > target:
        target = target.replace(year=target.year + 1)

    time_remaining = target - now

    return jsonify({
        'days': time_remaining.days,
        'hours': time_remaining.seconds // 3600,
        'minutes': (time_remaining.seconds % 3600) // 60,
        'seconds': time_remaining.seconds % 60,
        'total_seconds': int(time_remaining.total_seconds()),
        'anniversary_date': ANNIVERSARY_DATE
    })


@app.route('/api/is-anniversary-today')
def is_anniversary_today():
    """Vérifie si c'est l'anniversaire aujourd'hui"""
    now = datetime.now()
    target = datetime.strptime(ANNIVERSARY_DATE, "%Y-%m-%d")

    is_today = (now.month == target.month and now.day == target.day)

    return jsonify({
        'is_anniversaire_today': is_today,
        'current_date': now.strftime("%Y-%m-%d")
    })


@app.route('/download-card')
def download_card():
    """Générer et télécharger une carte d'anniversaire"""
    from reportlab.pdfgen import canvas
    from reportlab.lib.pagesizes import letter
    from reportlab.lib.units import inch
    from reportlab.lib.colors import HexColor

    # Créer un PDF en mémoire
    buffer = io.BytesIO()

    # Créer le canvas PDF
    p = canvas.Canvas(buffer, pagesize=letter)
    width, height = letter

    # Définir les couleurs
    bg_color = HexColor("#0c2461")
    text_color = HexColor("#ffdd59")
    accent_color = HexColor("#ff9f1a")

    # Dessiner le fond
    p.setFillColor(bg_color)
    p.rect(0, 0, width, height, fill=1, stroke=0)

    # Ajouter le titre
    p.setFillColor(text_color)
    p.setFont("Helvetica-Bold", 36)
    p.drawCentredString(width / 2, height - 2 * inch, "Joyeux Anniversaire Glodi NONDE!")

    # Ajouter un message
    p.setFillColor(accent_color)
    p.setFont("Helvetica", 24)
    p.drawCentredString(width / 2, height - 4 * inch, "Que cette journée soit remplie")
    p.drawCentredString(width / 2, height - 4.5 * inch, "de joie, de rires et de bonheur!")

    # Dessiner un gâteau simple
    p.setFillColor(HexColor("#e17055"))
    p.rect(width / 2 - 1.5 * inch, height / 2 - inch, 3 * inch, 0.8 * inch, fill=1, stroke=0)

    p.setFillColor(HexColor("#fab1a0"))
    p.rect(width / 2 - 1.2 * inch, height / 2 - 0.2 * inch, 2.4 * inch, 0.6 * inch, fill=1, stroke=0)

    p.setFillColor(HexColor("#fd79a8"))
    p.rect(width / 2 - 0.9 * inch, height / 2 + 0.4 * inch, 1.8 * inch, 0.4 * inch, fill=1, stroke=0)

    # Ajouter une bougie
    p.setFillColor(HexColor("#ffdd59"))
    p.rect(width / 2 - 0.1 * inch, height / 2 + 0.8 * inch, 0.2 * inch, 0.5 * inch, fill=1, stroke=0)

    p.setFillColor(HexColor("#ff9f1a"))
    p.circle(width / 2, height / 2 + 1.4 * inch, 0.15 * inch, fill=1, stroke=0)

    # Ajouter un message personnalisé
    p.setFillColor(HexColor("#ffffff"))
    p.setFont("Helvetica-Oblique", 18)
    p.drawCentredString(width / 2, 2 * inch, "Avec toute notre affection,")
    p.drawCentredString(width / 2, 1.5 * inch, "en ce jour spécial!")

    # Ajouter la date
    p.setFillColor(HexColor("#a5b1c2"))
    p.setFont("Helvetica", 14)
    p.drawCentredString(width / 2, inch, f"Créé le {datetime.now().strftime('%d/%m/%Y')}")

    # Finaliser le PDF
    p.showPage()
    p.save()

    # Préparer la réponse
    buffer.seek(0)
    return send_file(
        buffer,
        as_attachment=True,
        download_name="carte_anniversaire_Glodi.pdf",
        mimetype='application/pdf'
    )


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(debug=True, port=port)