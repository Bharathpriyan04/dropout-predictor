"""
Generate Enhanced Workflow Diagram for Poster (Figure 1)
"""
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.patches as patches
import numpy as np

def create_workflow_diagram():
    fig, ax = plt.subplots(figsize=(7.5, 2.3), dpi=300)
    ax.set_xlim(0, 100)
    ax.set_ylim(0, 32)
    ax.axis('off')
    
    steps = [
        {"title": "Student\nData", "x": 12, "icon": "db"},
        {"title": "Preprocessing\n& EDA", "x": 37, "icon": "gear"},
        {"title": "Data Science\nModel", "x": 63, "icon": "brain"},
        {"title": "Dropout Prediction\n& Insights", "x": 88, "icon": "users"}
    ]
    
    # Base circle color
    circle_color = '#005a9c'
    
    for i, s in enumerate(steps):
        cx = s["x"]
        cy = 19
        r = 8.8
        
        # Outer circle with crisp white/blue border
        circle = patches.Circle((cx, cy), radius=r, facecolor=circle_color, edgecolor='#00386b', linewidth=2, zorder=2)
        ax.add_patch(circle)
        
        # Crisp White Vector Glyphs
        if s["icon"] == "db":
            # 3 stacked database platters
            for dy in [-3.2, 0, 3.2]:
                el_back = patches.Ellipse((cx, cy + dy), width=8.5, height=3.2, facecolor='#ffffff', edgecolor='#00386b', linewidth=1.2, zorder=4)
                ax.add_patch(el_back)
                # inner line detail
                ax.plot([cx - 4.2, cx - 4.2], [cy + dy - 1.2, cy + dy], color='#ffffff', lw=1.5, zorder=4)
                ax.plot([cx + 4.2, cx + 4.2], [cy + dy - 1.2, cy + dy], color='#ffffff', lw=1.5, zorder=4)
        elif s["icon"] == "gear":
            # Gear / Preprocessing
            cg = patches.Circle((cx, cy), radius=4.2, facecolor='#ffffff', edgecolor='#00386b', linewidth=1.2, zorder=4)
            ax.add_patch(cg)
            cg_in = patches.Circle((cx, cy), radius=1.8, facecolor=circle_color, zorder=5)
            ax.add_patch(cg_in)
            # Teeth
            for angle in range(0, 360, 45):
                rad = np.radians(angle)
                tx1 = cx + 3.2 * np.cos(rad)
                ty1 = cy + 3.2 * np.sin(rad)
                tx2 = cx + 5.2 * np.cos(rad)
                ty2 = cy + 5.2 * np.sin(rad)
                ax.plot([tx1, tx2], [ty1, ty2], color='#ffffff', linewidth=3.2, solid_capstyle='round', zorder=3.5)
        elif s["icon"] == "brain":
            # Brain / AI Nodes
            cb = patches.Circle((cx, cy), radius=4.4, facecolor='#ffffff', edgecolor='#00386b', linewidth=1.2, zorder=4)
            ax.add_patch(cb)
            # Neural nodes
            nodes = [(-2.0, 1.6), (2.0, 1.6), (-2.0, -1.6), (2.0, -1.6), (0, 0)]
            for nx, ny in nodes:
                ax.add_patch(patches.Circle((cx + nx, cy + ny), radius=0.95, facecolor=circle_color, zorder=6))
            for n1 in nodes[:-1]:
                ax.plot([cx + n1[0], cx], [cy + n1[1], cy], color=circle_color, linewidth=1.4, zorder=5)
            ax.plot([cx - 2.0, cx + 2.0], [cy + 1.6, cy + 1.6], color=circle_color, linewidth=1.2, zorder=5)
            ax.plot([cx - 2.0, cx + 2.0], [cy - 1.6, cy - 1.6], color=circle_color, linewidth=1.2, zorder=5)
        elif s["icon"] == "users":
            # Group of Students / Retention
            for ux, uy in [(-2.6, 0.4), (2.6, 0.4), (0, 2.5)]:
                ax.add_patch(patches.Circle((cx + ux, cy + uy), radius=1.6, facecolor='#ffffff', edgecolor='#00386b', linewidth=1, zorder=4))
            ax.add_patch(patches.Ellipse((cx, cy - 2.8), width=8.8, height=3.5, facecolor='#ffffff', edgecolor='#00386b', linewidth=1, zorder=4))
            
        # Text label below
        ax.text(cx, 6.2, s["title"], ha='center', va='top', fontsize=9, fontweight='bold', color='#111111', linespacing=1.0)
        
        # Sleek Right Arrow connecting to next step
        if i < len(steps) - 1:
            next_x = steps[i+1]["x"]
            ax.annotate('', xy=(next_x - 10.2, cy), xytext=(cx + 10.2, cy),
                        arrowprops=dict(arrowstyle="->,head_width=0.45,head_length=0.7", color=circle_color, lw=2.5))
            
    wf_path = "d:/dropout-app/poster_assets/workflow.png"
    plt.savefig(wf_path, dpi=300, bbox_inches='tight', transparent=True)
    plt.close()
    print("Enhanced workflow generated successfully!")

if __name__ == "__main__":
    create_workflow_diagram()
