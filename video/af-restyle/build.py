import os
import html

BASE = os.path.dirname(os.path.abspath(__file__))
SLIDES = os.path.join(BASE, "slides")
os.makedirs(SLIDES, exist_ok=True)

LOGO = "../../../public/brand/mandi-v4-logo.png"
DOCTOR = "../assets/doctor.png"

CSS = r"""
@font-face{font-family:Montserrat;src:url('../../../public/fonts/Montserrat-VariableFont_wght.ttf');font-weight:100 900;}
*{box-sizing:border-box}
html,body{margin:0;padding:0;width:1920px;height:1080px;overflow:hidden;background:#FBF2E7}
body{font-family:Montserrat,Arial,sans-serif;color:#2C1810}
.slide{position:relative;width:1920px;height:1080px;background:#FBF2E7;overflow:hidden;padding:48px 80px}
.top{display:flex;align-items:center;gap:30px;min-height:86px}
.top .logo{width:150px;height:auto;display:block}
h1{font-size:50px;font-weight:800;letter-spacing:-1.4px;margin:0;line-height:1.12}
.source{position:absolute;top:56px;right:80px;font-size:15px;color:#5A4236;max-width:860px;text-align:right;line-height:1.45}
.main{position:absolute;left:80px;right:80px;top:206px;bottom:168px}
.bottom{position:absolute;left:80px;right:80px;bottom:44px;background:#4A352B;color:#fff;border-radius:8px;min-height:88px;display:flex;align-items:center;justify-content:center;padding:18px 52px;font-size:26px;font-weight:600;text-align:center;line-height:1.35}
.card{background:#fff;border-radius:18px;box-shadow:0 12px 30px rgba(103,60,51,.10);padding:32px 36px}
.card-head{border-radius:18px 18px 0 0;padding:22px 36px;font-size:23px;font-weight:700;color:#2C1810;background:linear-gradient(90deg,#FFD66B,#FFAA4F);line-height:1.25}
.card-body{padding:30px 36px 34px}
.label{font-size:15px;font-weight:700;letter-spacing:2.6px;text-transform:uppercase;color:#5A4236}
.item{display:flex;gap:18px;align-items:flex-start;font-size:27px;line-height:1.35;font-weight:500}
.item + .item{margin-top:24px}
.check{width:46px;height:46px;flex:0 0 46px;border-radius:50%;background:linear-gradient(135deg,#FFD66B,#F47B4C);display:flex;align-items:center;justify-content:center;margin-top:1px}
.cross{width:46px;height:46px;flex:0 0 46px;border-radius:50%;background:#F4E6D8;display:flex;align-items:center;justify-content:center;margin-top:1px}
.num{width:78px;height:78px;flex:0 0 78px;border-radius:50%;background:linear-gradient(135deg,#FFD66B,#F47B4C);display:flex;align-items:center;justify-content:center;font-size:40px;font-weight:800;color:#fff}
.grid2{display:grid;grid-template-columns:1fr 1fr;gap:34px}
.grid-arrow{display:grid;grid-template-columns:1fr 90px 1fr;gap:18px;align-items:center}
.arrow{font-size:86px;color:#E2633F;text-align:center;font-weight:700;line-height:1}
.big-number{font-size:220px;line-height:.82;font-weight:800;color:#E2633F;letter-spacing:-8px}
.subhead{font-size:44px;font-weight:700;line-height:1.18;margin-top:18px;letter-spacing:-1px}
.callout{background:linear-gradient(90deg,#FFAA4F,#FFD66B);border-radius:14px;padding:20px 26px;font-size:27px;font-weight:700;display:flex;align-items:center;gap:16px}
.chips{display:flex;flex-wrap:wrap;gap:12px;margin-top:34px;max-width:1120px}
.chip{display:flex;align-items:center;gap:12px;background:#fff;border-radius:12px;padding:14px 20px;font-size:23px;font-weight:600;box-shadow:0 8px 20px rgba(103,60,51,.08)}
.chip .ico{font-size:30px;line-height:1}
.phone{width:330px;height:660px;background:#3A2A24;border-radius:46px;padding:14px;box-shadow:0 26px 50px rgba(58,42,36,.28);flex:0 0 330px}
.screen{width:100%;height:100%;background:#FFFBF3;border-radius:34px;padding:26px 24px;position:relative;overflow:hidden}
.phone-title{font-size:26px;font-weight:700;text-align:center;line-height:1.2}
.phone-text{font-size:20px;line-height:1.35;text-align:center;color:#4A352B}
.phone-btn{margin-top:20px;background:#E2633F;color:#fff;border-radius:10px;padding:14px;text-align:center;font-size:20px;font-weight:700}
.field{border:1px solid #E4C7A8;background:#fff;border-radius:8px;padding:12px 12px;font-size:16px;color:#8A6A55;margin-top:10px}
.field-label{font-size:16px;font-weight:600;margin-top:16px;color:#4A352B}
.score-ring{width:190px;height:190px;border-radius:50%;background:conic-gradient(#F47B4C 0 64%,#FBE3CC 64% 100%);display:flex;align-items:center;justify-content:center;margin:16px auto 6px}
.score-inner{width:142px;height:142px;border-radius:50%;background:#FFFBF3;display:flex;align-items:center;justify-content:center;font-size:58px;font-weight:800;color:#2C1810}
.bar-row{display:grid;grid-template-columns:172px 1fr 34px;gap:8px;align-items:center;margin-top:14px;font-size:12px;font-weight:600}
.bar{height:14px;background:#FBE3CC;border-radius:99px;overflow:hidden}
.bar > i{display:block;height:14px;border-radius:99px;background:#F47B4C}
.network{width:720px;height:560px;position:relative}
.blanket-grid{display:grid;grid-template-columns:repeat(8,1fr);gap:6px;background:#FFFBF3;border-radius:20px;padding:16px;box-shadow:0 18px 44px rgba(140,60,30,.18)}
.patch{aspect-ratio:1/1;border-radius:7px;outline:1px dashed rgba(120,70,40,.35);outline-offset:-3px}
.patch.gold{box-shadow:0 0 0 1.5px #E9B13A,0 0 10px rgba(242,193,78,.7);outline-color:rgba(154,74,18,.5)}
.monitor{width:760px;background:#2F3A3D;border-radius:22px;padding:18px;box-shadow:0 24px 50px rgba(47,58,61,.25)}
.monitor-screen{background:#FFF;border-radius:10px;padding:20px;display:flex;gap:18px;min-height:430px}
.monitor-side{width:130px;border-right:1px solid #EEE;padding-right:12px;display:flex;flex-direction:column;gap:14px}
.monitor-line{height:12px;border-radius:5px;background:#E9E2D8}
.monitor-bar{height:12px;border-radius:5px;background:#F2E6D8}
.mono-label{font-size:24px;font-weight:700;margin-bottom:18px}
svg text{font-family:Montserrat,Arial,sans-serif !important}
"""


def page(body: str, extra: str = "") -> str:
    return (
        "<!doctype html><html><head><meta charset='utf-8'><style>"
        + CSS
        + "</style></head><body><div class='slide "
        + extra
        + "'>"
        + body
        + "</div></body></html>"
    )


def top(title: str, source: str = "") -> str:
    src = f"<div class='source'>{source}</div>" if source else ""
    return f"<div class='top'><img class='logo' src='{LOGO}' alt=''><h1>{title}</h1></div>{src}"


def bottom(text: str) -> str:
    return f"<div class='bottom'>{text}</div>"


CHECK = "<span class='check'><svg width='26' height='26' viewBox='0 0 24 24'><path d='M4 12.5l5 5L20 6.5' stroke='#fff' stroke-width='3' fill='none' stroke-linecap='round' stroke-linejoin='round'/></svg></span>"
CROSS = "<span class='cross'><svg width='24' height='24' viewBox='0 0 24 24'><path d='M6 6l12 12M18 6L6 18' stroke='#E2633F' stroke-width='2.6' stroke-linecap='round'/></svg></span>"


def item(text: str, kind: str = "check") -> str:
    return f"<div class='item'>{CHECK if kind == 'check' else CROSS}<span>{text}</span></div>"


def card(body: str, label: str = "", accent: bool = False, head: str = "") -> str:
    if head:
        return f"<div class='card' style='padding:0;overflow:hidden'><div class='card-head'>{head}</div><div class='card-body'>{body}</div></div>"
    lab = f"<div class='label' style='margin-bottom:24px'>{label}</div>" if label else ""
    return f"<div class='card'>{lab}{body}</div>"


def blanket_html(size: int = 56, gold_half: bool = True) -> str:
    grounds = ["#F8EEE2", "#F3DEC6", "#E2805C", "#B8472E", "#F6E8D2", "#F2D5C2", "#EC9264", "#C9562F"]
    inks = ["#C94A2B", "#9E3A26", "#FFFFFF", "#2C1810", "#B8431F"]
    golds = ["#FCE79A", "#FFD66B", "#FFAA4F", "#F2C14E"]
    patches = []
    for i in range(56):
        h = (i * 37 + 11) % 17
        level = 0 if h < 4 else 1 if h < 8 else 2 if h < 13 else 3
        is_gold = gold_half and level >= 1 and i % 2 == 0
        if is_gold:
            bg = golds[i % len(golds)]
            cls = "patch gold"
        else:
            bg = grounds[level * 2 % len(grounds)]
            cls = "patch"
        ink = inks[(i * 3) % len(inks)]
        motif = (
            f"radial-gradient(circle at 50% 50%, {ink} 0 16%, transparent 17%),"
            f"radial-gradient(circle at 20% 25%, {ink} 0 7%, transparent 8%),"
            f"radial-gradient(circle at 80% 75%, {ink} 0 7%, transparent 8%),"
            f"radial-gradient(circle at 25% 75%, {ink} 0 5%, transparent 6%)"
        )
        patches.append(
            f"<div class='{cls}' style='background:{motif}, {bg}'></div>"
        )
    return (
        f"<div class='blanket-grid' style='width:{size * 8 + 7 * 6 + 32}px'>"
        + "".join(patches)
        + "</div>"
    )


def phone_results() -> str:
    bars = [
        ("Warmteaanvalle", 80),
        ("Slaapprobleme", 65),
        ("Stemmingsveranderinge", 50),
        ("Gewrigs- en spierpyn", 40),
        ("Energie en moegheid", 35),
    ]
    rows = "".join(
        f"<div class='bar-row'><span>{label}</span><span class='bar'><i style='width:{value}%'></i></span><span>{value}</span></div>"
        for label, value in bars
    )
    return f"""
    <div class="phone"><div class="screen">
      <div class="phone-title">JOU RESULTATE</div>
      <div class="score-ring"><div class="score-inner">64</div></div>
      <div style="text-align:center;font-size:18px;font-weight:700;letter-spacing:2px">MENOSCORE</div>
      <div style="margin-top:18px">{rows}</div>
    </div></div>"""


def phone_form() -> str:
    return f"""
    <div class="phone"><div class="screen">
      <div style="font-size:17px;color:#8A6A55">9:41</div>
      <div class="phone-title" style="text-align:left;margin-top:8px">Jou inligting</div>
      <div class="field-label">Naam</div><div class="field">Skryf jou naam</div>
      <div class="field-label">Ouderdom</div><div class="field">Bv. 34</div>
      <div class="field-label">Foonnommer</div><div class="field">Bv. 082 123 4567</div>
      <div class="field-label">E-posadres</div><div class="field">Bv. jy@e-pos.co.za</div>
      <div class="phone-btn">Volgende</div>
    </div></div>"""


def phone_56() -> str:
    return f"""
    <div class="phone"><div class="screen">
      <div style="height:10px;background:#FBE3CC;border-radius:99px;overflow:hidden;margin-bottom:38px"><div style="width:42%;height:10px;background:#E2633F;border-radius:99px"></div></div>
      <div class="phone-title">Halfpad.</div>
      <div class="phone-title">Haal asem.</div>
      <div style="width:150px;height:150px;border-radius:50%;background:#E2633F;margin:42px auto 0;display:flex;align-items:center;justify-content:center">
        <svg width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.7" stroke-linecap="round"><path d="M4 9h9a3 3 0 0 0 0-6H8"/><path d="M4 15h12a3 3 0 0 1 0 6H9"/><path d="M4 12h5"/></svg>
      </div>
      <div style="position:absolute;left:22px;bottom:24px;width:52px;height:52px;border-radius:50%;background:#F2E6D8;display:flex;align-items:center;justify-content:center;font-size:26px">‹</div>
      <div style="position:absolute;right:22px;bottom:24px;width:52px;height:52px;border-radius:50%;background:#E2633F;color:#fff;display:flex;align-items:center;justify-content:center;font-size:26px">›</div>
    </div></div>"""


def phone_blanket() -> str:
    return f"""
    <div class="phone"><div class="screen">
      <div class="phone-title" style="margin-top:30px">JOU MANDI-KOMBERS</div>
      <div style="margin-top:24px;transform:scale(.86);transform-origin:top center">{blanket_html(28, True)}</div>
    </div></div>"""


def network_svg() -> str:
    nodes = [
        (360, 90, "Jy", "#F47B4C"),
        (150, 220, "", "#E2805C"),
        (570, 220, "", "#E2805C"),
        (200, 420, "", "#E2805C"),
        (520, 420, "", "#E2805C"),
    ]
    lines = "".join(
        f"<line x1='360' y1='320' x2='{x}' y2='{y}' stroke='#673C33' stroke-width='2' stroke-dasharray='3 8' opacity='.6'/>"
        for x, y, _, _ in nodes
    )
    people = "".join(
        f"<g><circle cx='{x}' cy='{y-20}' r='26' fill='{color}'/><rect x='{x-34}' y='{y+8}' width='68' height='62' rx='30' fill='{color}'/>{('<text x=\"'+str(x)+'\" y=\"'+str(y+104)+'\" text-anchor=\"middle\" font-size=\"26\" font-weight=\"600\" fill=\"#2C1810\">'+label+'</text>') if label else ''}</g>"
        for x, y, label, color in nodes
    )
    return f"""
    <svg class="network" viewBox="0 0 720 560" xmlns="http://www.w3.org/2000/svg">
      <circle cx="360" cy="320" r="240" fill="#F4E6D8" opacity=".45"/>
      {lines}
      <g><rect x="235" y="285" width="250" height="84" rx="42" fill="#673C33"/><text x="360" y="340" text-anchor="middle" font-family="Montserrat" font-size="36" font-weight="700" fill="#FFE7CC">Mandi</text></g>
      {people}
    </svg>"""


slides = {}

# 1 — title
slides["01-title"] = page(
    f"""<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%">
      <img src="{LOGO}" style="width:520px;height:auto;margin-bottom:64px">
      <h2 style="font-size:50px;font-weight:700;margin:0;letter-spacing:-1px">’n Inleiding vir dokters</h2>
    </div>""",
    "title",
)

# 2 — from nowhere
slides["02-from"] = page(
    top("Van nêrens om heen te gaan, na gehoor en gehelp")
    + f"""<div class="main grid-arrow">
      {card(item("Nêrens om heen te gaan: alleen in die stilte", "cross") + item("Swaar kry: simptome met ander toestande verwar", "cross") + item("Ontnugtering: gesê dis maar net natuurlik", "cross"), "VAN")}
      <div class="arrow">→</div>
      {card(item("Gehoor voel, in haar eie taal") + item("Deur ’n dokter wat die hele prentjie sien") + item("Gehelp, met ’n sorgplan saam met haar opgestel"), "NA, MET MANDI")}
    </div>"""
    + bottom("Met Mandi voel sy gehoor, in haar eie taal.")
)

# 3 — why, reason 1
slides["03-why1"] = page(
    top("Hoekom menopause moeilik is om reg te kry", "Bron: Nasionale Departement van Gesondheid &amp; Kennisvertalingsstigting. Volwasse Primêresorg (APC) 2026, v4.1, p. 187")
    + f"""<div class="main" style="display:flex;flex-direction:column;gap:26px;max-width:1320px">
      <div class="card" style="display:flex;gap:26px;align-items:flex-start"><div class="num">1</div><div style="font-size:30px;line-height:1.45;font-weight:600">Suid-Afrika se nasionale primêresorgids verwys skaars na perimenopouse en bied hormoonterapie slegs aan wanneer simptome die daaglikse lewe ontwrig</div></div>
    </div>"""
    + bottom("Dis ook vir dokters moeilik.")
)

# 4 — why, reason 2
slides["04-why2"] = page(
    top("Hoekom menopause moeilik is om reg te kry", "Bron: Nasionale Departement van Gesondheid &amp; Kennisvertalingsstigting. Volwasse Primêresorg (APC) 2026, v4.1, p. 187")
    + f"""<div class="main" style="display:flex;flex-direction:column;gap:26px;max-width:1320px">
      <div class="card" style="display:flex;gap:26px;align-items:flex-start"><div class="num">1</div><div style="font-size:28px;line-height:1.42;font-weight:600">Suid-Afrika se nasionale primêresorgids verwys skaars na perimenopouse en bied hormoonterapie slegs aan wanneer simptome die daaglikse lewe ontwrig</div></div>
      <div class="card" style="display:flex;gap:26px;align-items:flex-start"><div class="num">2</div><div style="font-size:28px;line-height:1.42;font-weight:600">Navorsers sê mediese en verpleegopleiding gee min aandag aan die endokrinologie van veroudering</div></div>
    </div>"""
    + bottom("Dis ook vir dokters moeilik.")
)

# 5 — how you contribute
slides["05-contribute"] = page(
    top("Hoe jy bydra")
    + f"""<div class="main" style="display:grid;grid-template-columns:820px 1fr;gap:40px;align-items:center">
      <div class="card">
        {item("’n Dokter op ’n klein Mandi-paneel")}
        {item("Opgelei in menopousesorg")}
        {item("Jou opleiding word deur Mandi gedek")}
        {item("Gereelde paneelsessies oor die jongste navorsing")}
      </div>
      {network_svg()}
    </div>"""
    + bottom("Dis waar jy inkom.")
)

# 6 — build, state 1
slides["06-build1"] = page(
    top("Wat ons saam sal bou")
    + f"""<div class="main" style="display:flex;justify-content:center;align-items:center">
      <div style="width:860px">{card(item("Slegs met haar toestemming") + item("Geanonimiseer") + item("Gestoor op bedieners in Kaapstad"), "HAAR ANTWOORDE")}</div>
    </div>"""
)

# 7 — build, state 2
slides["07-build2"] = page(
    top("Wat ons saam sal bou")
    + f"""<div class="main grid-arrow">
      {card(item("Slegs met haar toestemming") + item("Geanonimiseer") + item("Gestoor op bedieners in Kaapstad"), "HAAR ANTWOORDE")}
      <div></div>
      {card(item("Simptome") + item("Behandelings wat jy kies") + item("Hoe simptome mettertyd verander") + item("Uitwerking op produktiwiteit en verhoudings"), head="’n Suid-Afrikaanse databasis oor hormoongesondheid")}
    </div>"""
)

# 8 — build, final
slides["08-build3"] = page(
    top("Wat ons saam sal bou")
    + f"""<div class="main grid-arrow">
      {card(item("Slegs met haar toestemming") + item("Geanonimiseer") + item("Gestoor op bedieners in Kaapstad"), "HAAR ANTWOORDE")}
      <div class="arrow">→</div>
      {card(item("Simptome") + item("Behandelings wat jy kies") + item("Hoe simptome mettertyd verander") + item("Uitwerking op produktiwiteit en verhoudings"), head="’n Suid-Afrikaanse databasis oor hormoongesondheid")}
    </div>"""
    + bottom("Bewyse van vroue soos jou eie pasiënte.")
)

# 9 — there for every woman
slides["09-every"] = page(
    top("Daar vir elke vrou")
    + f"""<div class="main" style="display:grid;grid-template-columns:1fr 400px;gap:56px;align-items:center">
      <div style="display:flex;flex-direction:column;gap:24px">
        <div class="card" style="display:flex;gap:24px;align-items:center"><div style="font-size:32px;font-weight:800;color:#E2633F;width:160px;flex:0 0 160px">GRATIS</div><div style="font-size:26px;line-height:1.35">Haar opsomming en wenke, om na haar eie dokter te neem</div></div>
        <div class="card" style="display:flex;gap:24px;align-items:center"><img src="{DOCTOR}" style="width:96px;height:96px;object-fit:contain"><div><div style="font-size:40px;font-weight:800;color:#E2633F">LID</div><div style="font-size:26px;line-height:1.35;margin-top:4px">Gekoppel aan ’n Mandi-dokter wie se fooie deur mediesefonds gedek word</div></div></div>
        <div class="callout">Basiese dokterssorg vir vroue, nie ’n luukse nie</div>
      </div>
      <div style="display:flex;justify-content:center">
        <div class="phone"><div class="screen" style="display:flex;flex-direction:column;justify-content:center;align-items:center">
          <div class="phone-title">Jou resultate<br>is op pad</div>
          <div style="margin-top:42px;font-size:110px">📄</div>
          <div style="width:88px;height:88px;border-radius:50%;background:#E2633F;color:#fff;display:flex;align-items:center;justify-content:center;font-size:46px;margin-top:-34px;margin-left:90px">✓</div>
        </div></div>
      </div>
    </div>"""
    + bottom("Ons wil hê Mandi moet daar wees vir elke vrou.")
)

# 10 — 56, state 1
slides["10-56a"] = page(
    top("56 vrae, in jou eie taal")
    + f"""<div class="main" style="display:grid;grid-template-columns:1fr 400px;gap:60px;align-items:center">
      <div><div class="big-number">56</div><div class="subhead">eenvoudige vrae, in<br>sowat tien minute</div></div>
      <div style="display:flex;justify-content:center">{phone_56()}</div>
    </div>"""
)

# 11 — 56, chips
slides["11-56b"] = page(
    top("56 vrae, in jou eie taal")
    + f"""<div class="main" style="display:grid;grid-template-columns:1fr 400px;gap:40px;align-items:center">
      <div><div class="big-number">56</div><div class="subhead">eenvoudige vrae, in<br>sowat tien minute</div>
        <div class="chips">
          <div class="chip"><span class="ico">🔥</span>Warm gloed</div>
          <div class="chip"><span class="ico">🛏️</span>Slaap</div>
          <div class="chip"><span class="ico">😊</span>Bui</div>
          <div class="chip"><span class="ico">🧠</span>Geheue</div>
          <div class="chip"><span class="ico">🦴</span>Gewrigte</div>
          <div class="chip"><span class="ico">❤️</span>Intimiteit</div>
        </div>
      </div>
      <div style="display:flex;justify-content:center">{phone_56()}</div>
    </div>"""
    + bottom("Kort, gerusstellende feite: wat sy ervaar, is eg en behandelbaar.")
)

# 12 — blanket
slides["12-blanket"] = page(
    top("Haar Mandi-kombers")
    + f"""<div class="main" style="display:grid;grid-template-columns:400px 1fr;gap:60px;align-items:center">
      <div style="display:flex;justify-content:center">{phone_blanket()}</div>
      <div style="display:flex;justify-content:center">{blanket_html(64, True)}</div>
    </div>"""
    + bottom("Elke antwoord word ’n lappie. Geen twee komberse is dieselfde nie.")
)

# 13 — MenoScore, state 1
slides["13-score1"] = page(
    top("Haar MenoScore, en waar dit die swaarste druk")
    + f"""<div class="main" style="display:grid;grid-template-columns:1fr 400px;gap:56px;align-items:center">
      <div class="card" style="display:flex;gap:24px;align-items:center"><div style="font-size:80px">📄</div><div style="font-size:28px;line-height:1.4">Kort artikels oor haar mees uitdagende simptome, en oor menopause en hormoongesondheid</div></div>
      <div style="display:flex;justify-content:center">{phone_results()}</div>
    </div>"""
)

# 14 — MenoScore, both cards
slides["14-score2"] = page(
    top("Haar MenoScore, en waar dit die swaarste druk")
    + f"""<div class="main" style="display:grid;grid-template-columns:1fr 400px;gap:56px;align-items:center">
      <div style="display:flex;flex-direction:column;gap:24px">
        <div class="card" style="display:flex;gap:24px;align-items:center"><div style="font-size:80px">📄</div><div style="font-size:26px;line-height:1.4">Kort artikels oor haar mees uitdagende simptome, en oor menopause en hormoongesondheid</div></div>
        <div class="card" style="display:flex;gap:24px;align-items:center"><img src="{DOCTOR}" style="width:100px;height:100px;object-fit:contain"><div style="font-size:27px;line-height:1.35">Haar eie dokter, of ’n Mandi-dokter</div></div>
      </div>
      <div style="display:flex;justify-content:center">{phone_results()}</div>
    </div>"""
    + bottom("Dan maak sy ’n keuse: haar eie dokter, of ’n Mandi-dokter.")
)

# 15 — what she shares
slides["15-shares"] = page(
    top("Wat sy deel voor die konsultasie")
    + f"""<div class="main" style="display:grid;grid-template-columns:400px 1fr;gap:60px;align-items:center">
      <div style="display:flex;justify-content:center">{phone_form()}</div>
      <div class="card">
        {item("Medisyne en aanvullings")}
        {item("Hormone of voorbehoeding")}
        {item("Maandstonde, swangerskappe, allergieë")}
        {item("Famieliegeskiedenis")}
        {item("Ma se ouderdom by menopause")}
        {item("Laaste Papsmeer, mammogram, beenskandering")}
        {item("Mediese fonds")}
      </div>
    </div>"""
    + bottom("Wat jy andersins in die eerste tien minute sou uitvra.")
)

# 16 — one private summary
slides["16-summary"] = page(
    top("Een privaat opsomming, voordat julle ontmoet")
    + f"""<div class="main" style="display:grid;grid-template-columns:800px 1fr;gap:46px;align-items:center">
      <div class="monitor"><div class="monitor-screen">
        <div class="monitor-side"><div class="monitor-line"></div><div class="monitor-line"></div><div class="monitor-line"></div><div class="monitor-line"></div><div class="monitor-line"></div></div>
        <div style="flex:1"><div style="font-size:26px;font-weight:700;margin-bottom:18px">Pasiëntopsomming</div><div class="monitor-bar" style="width:92%;margin-bottom:12px"></div><div class="monitor-bar" style="width:78%;margin-bottom:26px"></div><div class="monitor-bar" style="width:65%;margin-bottom:12px"></div><div class="monitor-bar" style="width:88%;margin-bottom:26px"></div><div class="monitor-bar" style="width:94%"></div></div>
      </div></div>
      <div class="card">
        {item("Telling en moeilikste areas")}
        {item("Veiligheids- en spesialiswaarskuwings")}
        {item("Mediese en familiegeskiedenis")}
        {item("30-dae-simptoomdagboek")}
        {item("Al 56 antwoorde")}
      </div>
    </div>"""
    + bottom("Dertig dae se simptoomdagboek, en al 56 antwoorde.")
)

# Title slide needs a gradient background override.
slides["01-title"] = slides["01-title"].replace(
    "<style>",
    "<style>.slide.title{background:linear-gradient(135deg,#FFD66B 0%,#FFAA4F 45%,#F47B4C 100%);padding:0}",
    1,
)

for name, markup in slides.items():
    path = os.path.join(SLIDES, name + ".html")
    with open(path, "w", encoding="utf-8") as f:
        f.write(markup)
    print("wrote", path)
