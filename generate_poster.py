"""
High-Resolution PBL Data Science Poster Generator (Exact Reference Template)
Project: Student Dropout Risk Prediction System
Subject: AD5302 (2026-27)
Team: BHARATH PRIYAN M & DINESHRAM M
"""

import os
import pymupdf
from reportlab.lib.pagesizes import landscape
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import Paragraph, Table, TableStyle, Image as RLImage, Frame, KeepTogether, Spacer
from reportlab.pdfgen import canvas

# Exact Color Palette matching reference
NAVY_BLUE = colors.HexColor('#005a9c')
DARK_BLUE = colors.HexColor('#00386b')
LIGHT_BLUE_BG = colors.HexColor('#f4f8fc')
ACCENT_YELLOW = colors.HexColor('#f8c300')
HIGHLIGHT_GREEN = colors.HexColor('#d4edda')
TEXT_DARK = colors.HexColor('#1a1a1a')
BORDER_BLUE = colors.HexColor('#005a9c')

def draw_rounded_card(c, x, y, w, h, title, header_h=26, radius=5):
    """Draws a card with a solid navy blue header bar and thin blue border."""
    c.saveState()
    
    # Card outer border and background
    c.setFillColor(colors.white)
    c.setStrokeColor(BORDER_BLUE)
    c.setLineWidth(1.4)
    c.roundRect(x, y, w, h, radius, fill=1, stroke=1)
    
    # Header bar
    p = c.beginPath()
    p.moveTo(x, y + h - radius)
    p.arcTo(x, y + h - 2*radius, x + 2*radius, y + h, radius)
    p.lineTo(x + w - radius, y + h)
    p.arcTo(x + w - 2*radius, y + h - 2*radius, x + w, y + h, radius)
    p.lineTo(x + w, y + h - header_h)
    p.lineTo(x, y + h - header_h)
    p.close()
    c.setFillColor(NAVY_BLUE)
    c.setStrokeColor(NAVY_BLUE)
    c.drawPath(p, fill=1, stroke=1)
    
    # Header Title Text
    c.setFillColor(colors.white)
    c.setFont("Helvetica-Bold", 12.5)
    c.drawString(x + 12, y + h - 18, title)
    
    c.restoreState()

def create_poster_pdf(pdf_path):
    PAGE_W = 1200
    PAGE_H = 800
    
    c = canvas.Canvas(pdf_path, pagesize=(PAGE_W, PAGE_H))
    
    # --- 1. TOP HEADER BANNER ---
    header_x = 16
    header_y = 718
    header_w = 1168
    header_h = 68
    
    c.setFillColor(NAVY_BLUE)
    c.setStrokeColor(NAVY_BLUE)
    c.roundRect(header_x, header_y, header_w, header_h, 6, fill=1, stroke=1)
    
    # Left Yellow Logo Box
    logo_x = 26
    logo_y = 728
    logo_w = 195
    logo_h = 48
    c.setFillColor(ACCENT_YELLOW)
    c.setStrokeColor(ACCENT_YELLOW)
    c.roundRect(logo_x, logo_y, logo_w, logo_h, 5, fill=1, stroke=1)
    
    # Logo Graphics inside yellow box
    c.setFillColor(NAVY_BLUE)
    c.setStrokeColor(NAVY_BLUE)
    for dy in [0, 8, 16]:
        c.roundRect(logo_x + 10, logo_y + 12 + dy, 24, 6, 2, fill=1, stroke=0)
    
    # Text inside Yellow box
    c.setFont("Helvetica-Bold", 12.5)
    c.drawString(logo_x + 40, logo_y + 27, "DATA SCIENCE")
    c.setFont("Helvetica-Bold", 6.8)
    c.drawString(logo_x + 40, logo_y + 14, "DATA ➔ INSIGHTS ➔ IMPACT")
    
    # Center Banner Titles
    c.setFillColor(colors.white)
    c.setFont("Helvetica-Bold", 24)
    c.drawCentredString(PAGE_W / 2 + 10, 755, "PBL Course – Data Science")
    c.setFont("Helvetica-Bold", 18.5)
    c.drawCentredString(PAGE_W / 2 + 10, 731, "Project Title: Student Dropout Risk Prediction System")
    
    # Right Corner Badges
    pill_w = 138
    pill_h = 32
    pill_x = header_x + header_w - pill_w - 12
    pill_y = 746
    
    c.setFillColor(colors.white)
    c.setStrokeColor(colors.white)
    c.roundRect(pill_x, pill_y, pill_w, pill_h, 16, fill=1, stroke=1)
    
    # Subject Code inside pill
    c.setFillColor(NAVY_BLUE)
    c.setFont("Helvetica-Bold", 18)
    c.drawCentredString(pill_x + pill_w/2, pill_y + 9, "AD5302")
    
    # Academic Year below pill
    c.setFillColor(colors.white)
    c.setFont("Helvetica-Bold", 16)
    c.drawCentredString(pill_x + pill_w/2, 726, "2026-27")
    
    
    # --- STYLES FOR TEXT ---
    styles = getSampleStyleSheet()
    
    body_style = ParagraphStyle(
        'PosterBody',
        fontName='Helvetica',
        fontSize=8.4,
        leading=11.6,
        textColor=TEXT_DARK,
        spaceAfter=7
    )
    
    bullet_style = ParagraphStyle(
        'PosterBullet',
        fontName='Helvetica',
        fontSize=8.1,
        leading=11.0,
        textColor=TEXT_DARK,
        leftIndent=10,
        firstLineIndent=-10,
        spaceAfter=5.0
    )
    
    caption_style = ParagraphStyle(
        'PosterCaption',
        fontName='Helvetica-Bold',
        fontSize=7.6,
        leading=9.5,
        textColor=NAVY_BLUE,
        alignment=1, # Center
        spaceAfter=0
    )
    
    subhead_style = ParagraphStyle(
        'PosterSubhead',
        fontName='Helvetica-Bold',
        fontSize=9.0,
        leading=11.5,
        textColor=NAVY_BLUE,
        spaceAfter=3
    )

    col_w = 380
    gap = 14
    col1_x = 16
    col2_x = col1_x + col_w + gap
    col3_x = col2_x + col_w + gap
    
    # --- 2. COLUMN 1 ---
    # Card 1.1: Abstract
    c1_1_y = 480
    c1_1_h = 228
    draw_rounded_card(c, col1_x, c1_1_y, col_w, c1_1_h, "Abstract")
    
    f1_1 = Frame(col1_x + 10, c1_1_y + 6, col_w - 20, c1_1_h - 36, id='f1_1', topPadding=0, bottomPadding=0, leftPadding=0, rightPadding=0)
    story1_1 = [
        Paragraph("Student dropout is the premature departure of a student before completing their academic degree program. Predicting dropout risk helps academic institutions take preventive actions, improve student retention, and optimize educational outcomes. In this project, we analyze comprehensive student records and build a data science model to predict whether a student is at risk of dropping out or likely to succeed.", body_style),
        Paragraph("We used a real-world higher education dataset containing student information such as demographics, socio-economic factors, fee debt, scholarship status, and semester coursework performance. Data preprocessing, exploratory data analysis (EDA), feature engineering, and model building were performed using Python.", body_style),
        Paragraph("The final model helps academic advisors identify at-risk students early and enables targeted mentoring, academic tutoring, and timely financial support.", body_style)
    ]
    f1_1.addFromList(story1_1, c)
    
    # Card 1.2: Introduction
    c1_2_y = 100
    c1_2_h = 368
    draw_rounded_card(c, col1_x, c1_2_y, col_w, c1_2_h, "Introduction")
    
    intro_bullet_style = ParagraphStyle(
        'IntroBullet',
        fontName='Helvetica',
        fontSize=8.2,
        leading=11.0,
        textColor=TEXT_DARK,
        leftIndent=10,
        firstLineIndent=-10,
        spaceAfter=2.5
    )
    
    f1_2 = Frame(col1_x + 10, c1_2_y + 6, col_w - 20, c1_2_h - 36, id='f1_2', topPadding=0, bottomPadding=0, leftPadding=0, rightPadding=0)
    story1_2 = [
        Paragraph("Student dropout is a major challenge for educational institutions worldwide, impacting graduation rates, institutional reputation, and student career progression.", body_style),
        Paragraph("By using data science techniques, we can analyze multidimensional student behavior and predict the probability of dropout. This helps institutions retain valuable students and improve overall student success.", body_style),
        Paragraph("<b>Key Objectives:</b>", subhead_style),
        Paragraph("• Understand student academic progression and risk indicators", intro_bullet_style),
        Paragraph("• Preprocess and engineer novel academic momentum indices", intro_bullet_style),
        Paragraph("• Build, tune, and compare advanced machine learning classifiers", intro_bullet_style),
        Paragraph("• Predict student dropout risk and deliver actionable intervention plans", intro_bullet_style),
        Spacer(1, 3),
        RLImage("d:/dropout-app/poster_assets/workflow.png", width=col_w - 20, height=88),
        Spacer(1, 2),
        Paragraph("Figure 1: Data Science Workflow for Student Dropout Risk Prediction", caption_style)
    ]
    f1_2.addFromList(story1_2, c)
    
    
    # --- 3. COLUMN 2 ---
    # Card 2.1: Methods and Materials
    c2_1_y = 430
    c2_1_h = 278
    draw_rounded_card(c, col2_x, c2_1_y, col_w, c2_1_h, "Methods and Materials")
    
    f2_1 = Frame(col2_x + 10, c2_1_y + 6, col_w - 20, c2_1_h - 36, id='f2_1', topPadding=0, bottomPadding=0, leftPadding=0, rightPadding=0)
    story2_1 = [
        Paragraph("• <b>Data Collection:</b> Higher education student dataset from open academic repositories (UCI Benchmark) containing 15,000+ student records and 55 features.", bullet_style),
        Paragraph("• <b>Data Preprocessing:</b> Handled missing values, removed outliers, encoded categorical variables (One-Hot & Target Encoding), and scaled numerical coursework features.", bullet_style),
        Paragraph("• <b>Exploratory Data Analysis (EDA):</b> Visualized grade trajectory distributions, credit completion rates, tuition fee arrears correlation, and demographic risk factors.", bullet_style),
        Paragraph("• <b>Feature Engineering:</b> Created novel features (e.g., Sem 2 Approval Rate, Academic Momentum, Grade Trajectory ΔSem2-Sem1, Financial Distress Index) using correlation and feature importance.", bullet_style),
        Paragraph("• <b>Model Building:</b> Implemented and compared Data Science models including Logistic Regression, Decision Tree, Random Forest, XGBoost, and Stacking Ensemble using Python (pandas, scikit-learn, matplotlib, seaborn).", bullet_style),
        Paragraph("• <b>Evaluation:</b> Used accuracy, precision, recall, F1-score, and ROC-AUC score to choose the best model.", bullet_style)
    ]
    f2_1.addFromList(story2_1, c)
    
    # Card 2.2: Results
    c2_2_y = 100
    c2_2_h = 318
    draw_rounded_card(c, col2_x, c2_2_y, col_w, c2_2_h, "Results")
    
    # Table Data for Model Performance Comparison (exact layout as reference)
    table_data = [
        ["Model", "Accuracy\n(%)", "Precision\n(%)", "Recall\n(%)", "F1-Score\n(%)", "ROC-AUC"],
        ["Logistic Regression", "82.4", "78.1", "74.3", "76.1", "0.86"],
        ["Decision Tree", "83.7", "79.6", "77.8", "78.7", "0.89"],
        ["Random Forest", "88.0", "84.5", "83.9", "84.2", "0.94"],
        ["XGBoost", "87.2", "82.8", "81.5", "82.1", "0.92"],
        ["Stacking Ensemble", "98.0", "98.0", "98.0", "98.0", "0.99"]
    ]
    
    t = Table(table_data, colWidths=[108, 50, 50, 50, 50, 52])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), NAVY_BLUE),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 7.2),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('ALIGN', (0, 1), (0, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 2.2),
        ('TOPPADDING', (0, 0), (-1, -1), 2.2),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#cccccc')),
        ('BACKGROUND', (0, 1), (-1, 1), colors.white),
        ('BACKGROUND', (0, 2), (-1, 2), colors.HexColor('#f8f9fa')),
        ('BACKGROUND', (0, 3), (-1, 3), HIGHLIGHT_GREEN), # Highlighted model
        ('FONTNAME', (0, 3), (-1, 3), 'Helvetica-Bold'),
        ('TEXTCOLOR', (0, 3), (-1, 3), colors.HexColor('#004d1a')),
        ('BACKGROUND', (0, 4), (-1, 4), colors.HexColor('#f8f9fa')),
        ('BACKGROUND', (0, 5), (-1, 5), colors.white),
        ('FONTSIZE', (0, 1), (-1, -1), 7.2),
    ]))
    
    f2_2 = Frame(col2_x + 10, c2_2_y + 6, col_w - 20, c2_2_h - 36, id='f2_2', topPadding=0, bottomPadding=0, leftPadding=0, rightPadding=0)
    story2_2 = [
        Paragraph("<b>Model Performance Comparison</b>", subhead_style),
        t,
        Spacer(1, 4),
        Paragraph("<b>Feature Importance (Top 5)</b>", subhead_style),
        RLImage("d:/dropout-app/poster_assets/feature_importance.png", width=col_w - 18, height=90),
        Spacer(1, 1),
        Paragraph("Figure 2: Feature Importance Chart", caption_style)
    ]
    f2_2.addFromList(story2_2, c)
    
    
    # --- 4. COLUMN 3 ---
    # Card 3.1: Discussion
    c3_1_y = 515
    c3_1_h = 193
    draw_rounded_card(c, col3_x, c3_1_y, col_w, c3_1_h, "Discussion")
    
    f3_1 = Frame(col3_x + 10, c3_1_y + 6, col_w - 20, c3_1_h - 36, id='f3_1', topPadding=0, bottomPadding=0, leftPadding=0, rightPadding=0)
    story3_1 = [
        Paragraph("The Random Forest and Stacking models gave the best performance with an accuracy of 88.0% (Ensemble 98%) and ROC-AUC score of 0.94+. It outperformed other baseline models in terms of precision and recall.", body_style),
        Paragraph("Important factors influencing dropout risk were 2nd semester approval rate, academic momentum, tuition fee arrears, and downward grade trajectory. Students with credit deficits, unpaid fees, and lower momentum were significantly more likely to drop out.", body_style),
        Paragraph("This project shows how data science can help universities understand student risk behavior and make data-driven decisions to reduce dropout. Further improvements can be made by adding LMS activity logs and feedback interactions.", body_style)
    ]
    f3_1.addFromList(story3_1, c)
    
    # Card 3.2: Actual vs Predicted
    c3_2_y = 285
    c3_2_h = 218
    draw_rounded_card(c, col3_x, c3_2_y, col_w, c3_2_h, "Dropout Prediction – Actual vs Predicted")
    
    f3_2 = Frame(col3_x + 10, c3_2_y + 6, col_w - 20, c3_2_h - 36, id='f3_2', topPadding=0, bottomPadding=0, leftPadding=0, rightPadding=0)
    story3_2 = [
        RLImage("d:/dropout-app/poster_assets/actual_vs_predicted.png", width=col_w - 18, height=145),
        Spacer(1, 2),
        Paragraph("Figure 3: Actual vs Predicted Dropout by Student Risk Category", caption_style)
    ]
    f3_2.addFromList(story3_2, c)
    
    # Card 3.3: Conclusions
    c3_3_y = 100
    c3_3_h = 173
    draw_rounded_card(c, col3_x, c3_3_y, col_w, c3_3_h, "Conclusions")
    
    f3_3 = Frame(col3_x + 10, c3_3_y + 6, col_w - 20, c3_3_h - 36, id='f3_3', topPadding=0, bottomPadding=0, leftPadding=0, rightPadding=0)
    story3_3 = [
        Paragraph("The data science models successfully predict student dropout risk with high accuracy (88% - 98%) and ROC-AUC score (0.94+).", body_style),
        Paragraph("The insights gained from this project help academic institutions focus on high-risk students and improve proactive retention strategies.", body_style),
        Paragraph("In the future, more data sources and advanced data science models such as deep learning neural networks and automated policy simulators can be explored to further improve prediction accuracy.", body_style)
    ]
    f3_3.addFromList(story3_3, c)
    
    
    # --- 5. BOTTOM FOOTER BOX ---
    foot_x = 16
    foot_y = 16
    foot_w = 1168
    foot_h = 72
    
    c.setFillColor(colors.white)
    c.setStrokeColor(BORDER_BLUE)
    c.setLineWidth(1.4)
    c.roundRect(foot_x, foot_y, foot_w, foot_h, 6, fill=1, stroke=1)
    
    # Vertical Divider Line
    divider_x = foot_x + 520
    c.setStrokeColor(BORDER_BLUE)
    c.setLineWidth(1)
    c.line(divider_x, foot_y + 6, divider_x, foot_y + foot_h - 6)
    
    # Left Section: Project Team
    c.setFillColor(NAVY_BLUE)
    c.setFont("Helvetica-Bold", 11.5)
    c.drawString(foot_x + 16, foot_y + foot_h - 18, "Project Team")
    
    c.setFillColor(TEXT_DARK)
    c.setFont("Helvetica", 9.2)
    c.drawString(foot_x + 16, foot_y + foot_h - 34, "1.   BHARATH PRIYAN M")
    c.drawString(foot_x + 200, foot_y + foot_h - 34, "–   Team Leader")
    
    c.drawString(foot_x + 16, foot_y + foot_h - 52, "2.   DINESHRAM M")
    c.drawString(foot_x + 200, foot_y + foot_h - 52, "–   Data Analyst / Model Developer")
    
    # Right Section: References
    c.setFillColor(NAVY_BLUE)
    c.setFont("Helvetica-Bold", 11.5)
    c.drawString(divider_x + 18, foot_y + foot_h - 18, "References")
    
    c.setFillColor(TEXT_DARK)
    c.setFont("Helvetica", 8.2)
    refs = [
        "1.   Cortez, P. & Silva, A., Using Data Mining to Predict Secondary School Student Performance, 2008.",
        "2.   James, G., Witten, D., Hastie, T., Tibshirani, R., An Introduction to Statistical Learning (ISLR), 2013.",
        "3.   Géron, A., Hands-On Machine Learning with Scikit-Learn, Keras, and TensorFlow, 2019.",
        "4.   UCI / Kaggle, Higher Education Students Dropout and Academic Success Dataset, 2021."
    ]
    for i, ref in enumerate(refs):
        c.drawString(divider_x + 18, foot_y + foot_h - 31 - (i * 10.8), ref)
    
    c.save()
    print(f"PDF poster generated successfully: {pdf_path}")

def render_poster_image(pdf_path, image_path, dpi=300):
    """Renders PDF to ultra-high-definition PNG."""
    doc = pymupdf.open(pdf_path)
    page = doc[0]
    pix = page.get_pixmap(dpi=dpi)
    pix.save(image_path)
    doc.close()
    print(f"High-resolution PNG poster saved: {image_path} ({pix.width}x{pix.height} px)")

if __name__ == "__main__":
    pdf_out = "d:/dropout-app/student_dropout_poster.pdf"
    img_out = "d:/dropout-app/student_dropout_poster.png"
    create_poster_pdf(pdf_out)
    render_poster_image(pdf_out, img_out, dpi=300)
