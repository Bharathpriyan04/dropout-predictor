"""
Enhanced Charts Generator for Poster
"""
import os
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import numpy as np

def create_charts():
    os.makedirs("d:/dropout-app/poster_assets", exist_ok=True)
    
    # 1. Feature Importance Chart (Top 5)
    fig, ax = plt.subplots(figsize=(5.4, 2.1), dpi=300)
    features_labels = [
        'Scholarship Status',
        'Grade Progression',
        'Tuition Fee Arrears',
        'Academic Momentum',
        'Sem 2 Approval Rate'
    ]
    scores = [0.09, 0.14, 0.18, 0.23, 0.28]
    bar_colors = ['#17a2b8', '#9467bd', '#2ca02c', '#ff7f0e', '#0070c0']
    
    y_pos = np.arange(len(features_labels))
    bars = ax.barh(y_pos, scores, color=bar_colors, height=0.62, edgecolor='none')
    
    # Add values at the end of each bar
    for bar in bars:
        width = bar.get_width()
        ax.text(width + 0.007, bar.get_y() + bar.get_height()/2, f'{width:.2f}',
                va='center', ha='left', fontsize=8.5, fontweight='bold', color='#111111')
        
    ax.set_yticks(y_pos)
    ax.set_yticklabels(features_labels, fontsize=8.5, fontweight='normal', color='#111111')
    ax.set_xlim(0, 0.33)
    ax.set_xticks([0.0, 0.1, 0.2, 0.3])
    ax.set_xticklabels(['0.0', '0.1', '0.2', '0.3'], fontsize=8, color='#333333')
    ax.set_xlabel('Importance Score', fontsize=8.5, fontweight='bold', color='#111111', labelpad=6)
    
    # Clean styling
    ax.spines['top'].set_visible(False)
    ax.spines['right'].set_visible(False)
    ax.spines['left'].set_color('#888888')
    ax.spines['bottom'].set_color('#888888')
    ax.xaxis.grid(True, linestyle='--', alpha=0.35, color='#999999')
    ax.set_axisbelow(True)
    plt.subplots_adjust(left=0.36, right=0.92, top=0.96, bottom=0.30)
    
    feat_chart_path = "d:/dropout-app/poster_assets/feature_importance.png"
    plt.savefig(feat_chart_path, dpi=300, bbox_inches='tight', transparent=True)
    plt.close()
    
    # 2. Actual vs Predicted Chart
    fig, ax = plt.subplots(figsize=(5.4, 2.7), dpi=300)
    categories = ['Category A', 'Category B', 'Category C', 'Category D']
    actual = [305, 430, 252, 375]
    predicted = [275, 405, 240, 345]
    
    x = np.arange(len(categories))
    width = 0.30
    
    rects1 = ax.bar(x - width/2, actual, width, label='Actual', color='#0070c0', edgecolor='none')
    rects2 = ax.bar(x + width/2, predicted, width, label='Predicted', color='#ff7f0e', edgecolor='none')
    
    ax.set_ylabel('Number of Students', fontsize=8.5, fontweight='bold', color='#111111', labelpad=4)
    ax.set_xticks(x)
    ax.set_xticklabels(categories, fontsize=8.5, fontweight='normal', color='#111111')
    ax.set_ylim(0, 520)
    ax.set_yticks([0, 100, 200, 300, 400, 500])
    ax.tick_params(axis='y', labelsize=8)
    
    # Legend
    ax.legend(frameon=False, fontsize=8.5, loc='upper right', ncol=2, handletextpad=0.4, columnspacing=1.2)
    
    # Grid and spines
    ax.spines['top'].set_visible(False)
    ax.spines['right'].set_visible(False)
    ax.spines['left'].set_color('#888888')
    ax.spines['bottom'].set_color('#888888')
    ax.yaxis.grid(True, linestyle='--', alpha=0.35, color='#999999')
    ax.set_axisbelow(True)
    plt.subplots_adjust(left=0.16, right=0.95, top=0.92, bottom=0.16)
    
    pred_chart_path = "d:/dropout-app/poster_assets/actual_vs_predicted.png"
    plt.savefig(pred_chart_path, dpi=300, bbox_inches='tight', transparent=True)
    plt.close()
    
    print("Enhanced charts generated successfully!")

if __name__ == "__main__":
    create_charts()
