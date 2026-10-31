import sys, os, argparse
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1] / '.pdf-tools'))
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor, Color
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import Paragraph
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from pypdf import PdfReader
import fitz

ROOT=Path(__file__).resolve().parents[1]
parser=argparse.ArgumentParser()
parser.add_argument('--live',default='');parser.add_argument('--repo',default='');parser.add_argument('--name',default='')
args=parser.parse_args()
for name,file in [('Fomi','segoeui.ttf'),('FomiBold','seguisb.ttf')]:pdfmetrics.registerFont(TTFont(name,'C:/Windows/Fonts/'+file))
OUT=ROOT/'output/pdf/Fomi-Part-A-Submission.pdf';OUT.parent.mkdir(parents=True,exist_ok=True)
W,H=595.28,841.89;M=44;CW=W-2*M
c=canvas.Canvas(str(OUT),pagesize=(W,H));c.setTitle('Fomi | Part A - Frontend Assessment');c.setAuthor(args.name or 'Frontend assessment candidate')
INK=HexColor('#282622');MUTED=HexColor('#756c65');PEACH=HexColor('#f5e8e0');ACCENT=HexColor('#bf775d');BORDER=HexColor('#e6dcd5')
styles={
 'body':ParagraphStyle('body',fontName='Fomi',fontSize=9.5,leading=14,textColor=INK,spaceAfter=9),
 'small':ParagraphStyle('small',fontName='Fomi',fontSize=8,leading=11.5,textColor=MUTED),
 'heading':ParagraphStyle('heading',fontName='FomiBold',fontSize=12,leading=17,textColor=INK),
}
def para(text,y,style='body',x=M,width=CW):
 p=Paragraph(text,styles[style]);pw,ph=p.wrap(width,H);p.drawOn(c,x,y-ph);return y-ph-10

def page(number,kicker,title,subtitle):
 c.setFillColor(HexColor('#fcfaf8'));c.rect(0,0,W,H,fill=1,stroke=0)
 c.setFillColor(INK);c.setFont('FomiBold',18);c.drawString(M,H-47,'F')
 c.setFillColor(ACCENT);c.setFont('FomiBold',8);c.drawString(M+27,H-43,'FOMI / FRONTEND ASSESSMENT')
 c.setStrokeColor(BORDER);c.line(M,H-60,W-M,H-60)
 c.setFillColor(MUTED);c.setFont('FomiBold',8);c.drawString(M,H-86,kicker.upper())
 c.setFillColor(INK);c.setFont('FomiBold',25);c.drawString(M,H-120,title)
 y=para(subtitle,H-135,'small')
 c.setStrokeColor(BORDER);c.line(M,42,W-M,42)
 c.setFillColor(MUTED);c.setFont('Fomi',7.5);c.drawString(M,28,'PART A / Reference implementation / 30 October 2026');c.drawRightString(W-M,28,f'{number} / 3')
 return y-12

def heading(text,y):return para(text,y,'heading')-1

def field(label,name,value,y):
 c.setFillColor(MUTED);c.setFont('FomiBold',8);c.drawString(M,y,label)
 c.acroForm.textfield(name=name,tooltip=label,x=M,y=y-32,width=CW,height=24,value=value,fontName='Helvetica',fontSize=9,borderWidth=.6,borderColor=BORDER,fillColor=HexColor('#ffffff'),textColor=INK,forceBorder=True)
 if value.startswith(('https://','http://')):c.linkURL(value,(M,y-32,W-M,y-8),relative=0,thickness=0)
 return y-51

y=page(1,'Submission overview','Creative workspace.','Responsive AI Content Generation Web Page | Part A - Product Implementation')
y=para('A responsive Next.js workspace that reproduces the supplied Fomi mockup and turns the reference controls into usable frontend interactions.',y)
y=field('CANDIDATE','candidate_name',args.name,y)
y=field('LIVE VERCEL URL','vercel_url',args.live,y)
y=field('GITHUB REPOSITORY URL','github_url',args.repo,y)
if not args.live or not args.repo:y=para('Complete the link fields before submission. The live deployment and repository have not been published yet.',y,'small')
y=heading('Reference-led desktop implementation',y-2)
image=ROOT/'artifacts/reference-904.png'
ih=CW*440/904
c.setStrokeColor(BORDER);c.roundRect(M-1,y-ih-1,CW+2,ih+2,6,stroke=1,fill=0)
c.drawImage(str(image),M,y-ih,width=CW,height=ih,mask='auto');y-=ih+16
para('Compact icon navigation, floating history, peach generation controls, a prompt-information rail and a four-column portrait grid. Seven supplied portrait originals are used; one additional demo entry is explicitly marked as reused.',y,'small')
c.showPage()

y=page(2,'Implementation & engineering','Built for interaction.','The visual reference remains the primary specification. Additional workflows sit behind navigation.')
y=heading('Stack and architecture',y)
y=para('<b>Next.js App Router, JavaScript/JSX, React and Tailwind CSS.</b> Motion handles restrained transitions; Lucide and custom SVG provide interface icons. Local JSON maps assets. Browser storage retains demo history, settings, favorites and projects.',y)
y=para('The route handlers separate response data from the UI. Shared controls, branding, image rendering, the canvas editor and video workspace live in dedicated modules. Source files are consistently formatted with Prettier. CSS Modules were not required because the assessment also permits Tailwind CSS.',y)
y=heading('Functional scope',y)
for text in [
 '<b>Image generation:</b> prompt validation, 1/2/4/8 outputs, five ratios, six models, eight styles and advanced settings. POST /api/generate returns existing local images with a simulation flag.',
 '<b>Video demo:</b> POST /api/video/generate returns a prebuilt local motion sample with loading and error handling. Playback, pause, mute, download, reference upload and local video upload work. The sample is explicitly identified as procedural, not AI-generated.',
 '<b>Collection and editing:</b> search, favorites, previews, downloads and locally saved projects. Canvas tools apply crop, rotation, flip, zoom and color adjustments to actual exported PNG pixels.'
]:y=para(text,y)
y=heading('Responsive behavior and accessibility',y)
y=para('Desktop keeps the dense reference composition. Tablet reduces spacing. Mobile uses a vertical control layout, collapsible controls, a two-column image grid and scrollable history. Form labels, image alt text, semantic buttons, native modal focus behavior, visible focus states and reduced-motion support are built in.',y)
y=heading('Validation',y)
y=para('Production compilation succeeds. Ten browser tests pass. The automated suite covers reference geometry, navigation, mock APIs, validation, favorites, downloads, local persistence, project workflows, canvas transformations and video playback. Overflow checks cover widths of 320, 390, 768, 1280 and 1920 pixels. All 24 supplied image URLs are valid.',y)
y=para('next/image provides responsive image delivery and lazy loading. The production page uses approximately 165 kB of initial JavaScript; this is a build measurement, not a Lighthouse score. Final verification details are recorded in TEST-REPORT.md.',y,'small')
c.showPage()

y=page(3,'Design rationale & trade-offs','Capability, with restraint.','These notes explain the Part A implementation. They do not claim completion of the optional Part B redesign.')
y=heading('1. Problem and intended user',y)
y=para('Implement the supplied professional creative workspace faithfully while making the controls useful. The primary user is a creator or designer who needs fast access to prompts, settings, previous work and downloadable results without a marketing page interrupting the workflow.',y)
y=heading('2. Three important UX decisions',y)
for text in [
 '<b>Keep the output canvas dominant.</b> Compact controls and a narrow prompt rail preserve room for visual comparison.',
 '<b>Use progressive disclosure.</b> Advanced settings and styles stay collapsed until needed; gallery management and editing are available through the main navigation.',
 '<b>Make system behavior explicit.</b> Validation, loading, empty states and toasts provide feedback. Mock generation and sample reuse are labeled so users understand what the demo actually does.'
]:y=para(text,y)
y=heading('3. Features intentionally excluded',y)
y=para('Real model inference, authentication, payments, cloud synchronization, collaboration and full video editing are excluded. They would add infrastructure and testing cost without proving the core frontend task. Local persistence and mock endpoints demonstrate the interaction architecture within the assessment scope.',y)
y=heading('4. Design inspiration',y)
y=para('The supplied Fomi mockup guided layout, palette, spacing and button treatment. The implementation does not claim original authorship of that visual composition. The other products listed in the brief are optional references; this Part A submission does not claim to reproduce or evaluate their workflows.',y)
y=heading('5. Improvements with another month',y)
y=para('Validate frequent creator tasks with users; improve touch-target sizing and contrast; add deeper keyboard and screen-reader checks; extract more of the main orchestration into feature modules; then integrate a real provider behind the existing API contract and measure performance on representative devices.',y)
y=heading('6. Strongest implemented workflow',y)
y=para('Generate a demo, collect selected outputs in a project, then adjust and export an image without leaving the workspace. This is the strongest implemented flow; no market-wide uniqueness claim is made. An original, differentiated workflow would be the separate focus of optional Part B.',y)
if y<55:raise RuntimeError(f'Page 3 content overflow: {y}')
c.save()
reader=PdfReader(str(OUT));assert len(reader.pages)==3
fields=reader.get_fields();assert set(fields)=={'candidate_name','vercel_url','github_url'}
for key,value in {'candidate_name':args.name,'vercel_url':args.live,'github_url':args.repo}.items():assert fields[key].get('/V','')==value
for page_ in reader.pages:
 for annotation in page_.get('/Annots',[]):
  annotation=annotation.get_object()
  if annotation.get('/Subtype')=='/Widget':assert annotation.get('/AP') and annotation['/AP'].get('/N')
doc=fitz.open(OUT)
for i,p in enumerate(doc):p.get_pixmap(matrix=fitz.Matrix(1.25,1.25)).save(ROOT/f'tmp/pdfs/part-a-page-{i+1}.png')
print(f'Created {OUT}; verified 3 pages and 3 editable fields; rendered all pages.')

