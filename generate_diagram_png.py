import matplotlib.pyplot as plt
import matplotlib.patches as patches

def create_architecture_diagram():
    fig, ax = plt.subplots(figsize=(12, 7.2), dpi=300)
    ax.set_xlim(0, 100)
    ax.set_ylim(0, 100)
    ax.axis('off')

    # Background canvas
    canvas = patches.FancyBboxPatch((0.5, 0.5), 99, 99, boxstyle="round,pad=0.3",
                                    edgecolor="#CBD5E1", facecolor="#FFFFFF", linewidth=1.5)
    ax.add_patch(canvas)

    # Title Bar
    title_bar = patches.FancyBboxPatch((0.5, 92), 99, 7.5, boxstyle="round,pad=0.2",
                                       edgecolor="#0F172A", facecolor="#142542", linewidth=1)
    ax.add_patch(title_bar)
    ax.text(50, 95.7, "ARENA.AIML — HIGH-LEVEL SYSTEM ARCHITECTURE & DATA FLOW", 
            ha='center', va='center', color='#FFFFFF', fontsize=13, weight='bold')

    # Function to draw styled group boxes
    def draw_box(x, y, w, h, bg_color, border_color, title, title_color="#FFFFFF", title_bg=None):
        # Outer box
        rect = patches.FancyBboxPatch((x, y), w, h, boxstyle="round,pad=0.4",
                                      edgecolor=border_color, facecolor=bg_color, linewidth=1.2)
        ax.add_patch(rect)
        # Header banner
        if title_bg:
            head = patches.FancyBboxPatch((x, y + h - 5.5), w, 5.5, boxstyle="round,pad=0.2",
                                          edgecolor=border_color, facecolor=title_bg, linewidth=1)
            ax.add_patch(head)
            ax.text(x + w/2, y + h - 2.8, title, ha='center', va='center', 
                    color=title_color, fontsize=8.5, weight='bold')
        else:
            ax.text(x + w/2, y + h - 3, title, ha='center', va='center', 
                    color=border_color, fontsize=8.5, weight='bold')

    # Function to draw inner card
    def draw_card(x, y, w, h, title, lines, title_color="#0F172A", border="#E2E8F0", bg="#FFFFFF"):
        card = patches.FancyBboxPatch((x, y), w, h, boxstyle="round,pad=0.2",
                                      edgecolor=border, facecolor=bg, linewidth=0.9)
        ax.add_patch(card)
        ax.text(x + w/2, y + h - 2.5, title, ha='center', va='center', 
                color=title_color, fontsize=7.5, weight='bold')
        line_y = y + h - 5.2
        for l in lines:
            ax.text(x + w/2, line_y, l, ha='center', va='center', 
                    color="#475569", fontsize=6.5)
            line_y -= 2.6

    # 1. User Roles (Left)
    draw_box(2, 6, 14, 83, "#F8FAFC", "#64748B", "USER ROLES", title_bg="#475569")
    draw_card(3, 62, 12, 19, "Student Role", ["• Discover & RSVP", "• AI Assistant Bot", "• Razorpay & QR Pass"], "#1E40AF", "#93C5FD", "#EFF6FF")
    draw_card(3, 36, 12, 23, "Faculty Role", ["• Event Creation", "• AI Poster Studio", "• Email Campaigns", "• Feedback Analytics"], "#065F46", "#A7F3D0", "#ECFDF5")
    draw_card(3, 11, 12, 22, "Admin Role", ["• Event Approvals", "• User Management", "• Institutional Audits", "• Analytics View"], "#92400E", "#FDE68A", "#FFFBEB")

    # 2. Client Presentation Tier (React 19)
    draw_box(18, 6, 17, 83, "#F0F9FF", "#0284C7", "CLIENT TIER (React 19)", title_bg="#0284C7")
    draw_card(19.5, 66, 14, 15, "Role Dashboards", ["Student Feed & Calendar", "Faculty Studio Portal", "Admin Control Panel"], "#0369A1")
    draw_card(19.5, 47, 14, 16, "AI Hub Workspaces", ["AI Poster Generator", "Event Description AI", "Email Broadcast Studio"], "#0369A1")
    draw_card(19.5, 27, 14, 17, "Commerce & Passes", ["Interactive Calendar", "Razorpay Modal SDK", "HMAC-Verified QR Pass"], "#0369A1")
    draw_card(19.5, 9, 14, 15, "Client Core Stack", ["Axios Interceptors", "React Router DOM 7", "Framer Motion FX"], "#0369A1")

    # 3. API Gateway & Security
    draw_box(37, 6, 17, 83, "#F0FDF4", "#16A34A", "API GATEWAY & SEC", title_bg="#16A34A")
    draw_card(38.5, 68, 14, 13, "Security & Auth", ["JWT Authentication", "Role RBAC Middleware", "Helmet & CORS Protections"], "#15803D")
    draw_card(38.5, 48, 14, 17, "Core REST Routes", ["/api/events (CRUD)", "/api/registrations", "/api/payments/razorpay", "/api/feedback"], "#15803D")
    draw_card(38.5, 29, 14, 16, "AI Endpoint Router", ["/api/ai/poster/generate", "/api/ai/event/description", "/api/ai/recommendations"], "#15803D")
    draw_card(38.5, 9, 14, 17, "Payment Gateway", ["Razorpay Order Creation", "HMAC-SHA256 Sig Check", "Nodemailer Dispatcher"], "#15803D")

    # 4. Central AI Hub & Recommender Engine
    draw_box(56, 38, 23, 51, "#FAF5FF", "#7E22CE", "AI HUB & RECOMMENDER", title_bg="#7E22CE")
    draw_card(57.5, 66, 20, 17, "Multi-Signal Recommender", 
              ["Jaccard Tag Sim: J(A,B) = |A∩B|/|A∪B|", 
               "User Interest Keyword Overlap", 
               "Dept Match + Urgency Decay",
               "Score = Σ(w_i · signal_i)"], "#6B21A8", "#E9D5FF")
    draw_card(57.5, 49, 20, 15, "Prompt Registry & Cache", 
              ["Dynamic Variable Interpolation", 
               "JSON Schema Mode (T=0.2)", 
               "15-min Deterministic TTL Cache"], "#6B21A8", "#E9D5FF")
    draw_card(57.5, 40, 20, 8, "Model Providers", 
              ["Gemini 1.5 • GPT-4o • Pollinations"], "#6B21A8", "#E9D5FF")

    # 5. Persistence Tier
    draw_box(56, 6, 23, 29, "#FFF1F2", "#E11D48", "PERSISTENCE & STORAGE", title_bg="#E11D48")
    draw_card(57.5, 17, 20, 12, "MongoDB Atlas", ["Events • Registrations • Users", "AI Prompt Generation Logs"], "#9F1239", "#FECDD3")
    draw_card(57.5, 8, 20, 8, "MockStore & Caching", ["Offline Dev Mode • Mock Fallback"], "#9F1239", "#FECDD3")

    # 6. Deliverables (Right)
    draw_box(81, 6, 17, 83, "#F0FDFA", "#0D9488", "SYSTEM DELIVERABLES", title_bg="#0D9488")
    draw_card(82.5, 69, 14, 12, "Personalized Feed", ["Ranked student events", "based on tag & interest fit"], "#0F766E", "#99F6E4")
    draw_card(82.5, 53, 14, 13, "AI Promo Posters", ["Diffusion-synthesized", "high-res marketing posters"], "#0F766E", "#99F6E4")
    draw_card(82.5, 37, 14, 13, "Verified QR Passes", ["Tamper-evident tickets", "for fast physical entry"], "#0F766E", "#99F6E4")
    draw_card(82.5, 21, 14, 13, "NLP Sentiment Insights", ["Thematic breakdown &", "actionable event feedback"], "#0F766E", "#99F6E4")
    draw_card(82.5, 8, 14, 11, "Targeted Outreach", ["Automated HTML email", "broadcast campaigns"], "#0F766E", "#99F6E4")

    # Flow Arrows
    arrow_props = dict(arrowstyle="->", lw=1.3, color="#334155", shrinkA=2, shrinkB=2)
    
    # User -> Client
    ax.annotate("", xy=(18, 70), xytext=(16, 70), arrowprops=arrow_props)
    ax.annotate("", xy=(18, 47), xytext=(16, 47), arrowprops=arrow_props)
    ax.annotate("", xy=(18, 20), xytext=(16, 20), arrowprops=arrow_props)

    # Client <-> Gateway
    ax.annotate("", xy=(37, 50), xytext=(35, 50), arrowprops=dict(arrowstyle="<->", lw=1.5, color="#0284C7"))

    # Gateway <-> AI Hub
    ax.annotate("", xy=(56, 65), xytext=(54, 65), arrowprops=dict(arrowstyle="<->", lw=1.5, color="#7E22CE"))

    # Gateway <-> DB
    ax.annotate("", xy=(56, 20), xytext=(54, 20), arrowprops=dict(arrowstyle="<->", lw=1.5, color="#E11D48"))

    # AI Hub <-> DB
    ax.annotate("", xy=(67.5, 35), xytext=(67.5, 38), arrowprops=dict(arrowstyle="->", lw=1.2, ls="--", color="#6B21A8"))

    # AI / Gateway -> Deliverables
    ax.annotate("", xy=(81, 70), xytext=(79, 70), arrowprops=dict(arrowstyle="->", lw=1.5, color="#0D9488"))
    ax.annotate("", xy=(81, 45), xytext=(79, 45), arrowprops=dict(arrowstyle="->", lw=1.5, color="#0D9488"))
    ax.annotate("", xy=(81, 20), xytext=(79, 20), arrowprops=dict(arrowstyle="->", lw=1.5, color="#0D9488"))

    plt.tight_layout()
    output_path = r"c:\Users\Sujyot\arena.aiml\architecture_diagram.png"
    plt.savefig(output_path, dpi=300, bbox_inches='tight')
    print("Saved architecture_diagram.png successfully!")

if __name__ == "__main__":
    create_architecture_diagram()
