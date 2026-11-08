/* Indian Card Catalog + print controls. PVC-only extension. */
(()=>{'use strict';
const $=id=>document.getElementById(id), PX=96/25.4;
const catalog=[
{group:'Identity & Government',items:[
['Aadhaar PVC','आधार PVC',86,54,'UIDAI size','verified-label'],
['Voter ID / EPIC','वोटर ID / EPIC',86,54,'ECI format','issuer-check'],
['PAN Card','पैन कार्ड',85.6,53.98,'ID-1 common print size*','suggested'],
['Driving Licence','ड्राइविंग लाइसेंस',85.6,53.98,'ID-1 smart-card size','suggested'],
['Vehicle RC','वाहन RC',85.6,53.98,'ID-1 smart-card size','suggested'],
['UDID Disability ID','UDID दिव्यांग ID',85.6,53.98,'Original / Custom','custom'],
['NPR / MNIC','NPR / MNIC',85.6,53.98,'Original / Custom','custom'],
['Government Employee / Pension ID','सरकारी कर्मचारी / पेंशन ID',85.6,53.98,'Original / Custom','custom']]},
{group:'Health & Welfare',items:[
['Ayushman / PM-JAY','आयुष्मान / PM-JAY',85.6,53.98,'ID-1 suggested size*','suggested'],
['ABHA Health ID','ABHA हेल्थ ID',85.6,53.98,'Original / Custom','custom'],
['CGHS / ECHS / State Health Card','CGHS / ECHS / राज्य हेल्थ कार्ड',85.6,53.98,'Original / Custom','custom']]},
{group:'Labour, Agriculture & Property',items:[
['e-Shram / UAN','ई-श्रम / UAN',85.6,53.98,'Original / Custom','custom'],
['MGNREGA Job Card','मनरेगा जॉब कार्ड',85.6,53.98,'Original / Custom','custom'],
['Kisan Credit / Farmer Card','किसान क्रेडिट / किसान कार्ड',85.6,53.98,'Original / Custom','custom'],
['Ration / Family Card','राशन / परिवार कार्ड',148,105,'State format · Original / Custom','custom'],
['SVAMITVA / Property Card','स्वामित्व / प्रॉपर्टी कार्ड',148,105,'State format · Original / Custom','custom'],
['Labour / Construction Worker Card','लेबर / निर्माण श्रमिक कार्ड',85.6,53.98,'Original / Custom','custom']]},
{group:'Education & Other',items:[
['APAAR / ABC Academic ID','APAAR / ABC अकादमिक ID',85.6,53.98,'Original / Custom','custom'],
['School / College / Student ID','स्कूल / कॉलेज / स्टूडेंट ID',85.6,53.98,'ID-1 or Custom','suggested'],
['Company / Organization ID','कंपनी / संस्था ID',85.6,53.98,'ID-1 or Custom','suggested'],
['Other State / Department Card','अन्य राज्य / विभागीय कार्ड',85.6,53.98,'Original / Custom','custom']]}
];
const flat=catalog.flatMap(g=>g.items);
const oldDocs=docs;
docs.splice(0,docs.length,...flat.map((d,i)=>[d[0],d[1],String(d[2]),String(d[3]),d[0].slice(0,3).toUpperCase()]));
let selected=flat[0],lang='en',copies=1,gap=3,corner='original',mirror=false;
const oldList=$('doclist'); oldList.innerHTML='';
const search=$('search'); search.placeholder='Search India Card Catalog…';
const select=$('kind'); select.innerHTML='';
function text(en,hi){return lang==='en'?en:hi}
function renderCatalog(filter=''){
 oldList.innerHTML='';
 catalog.forEach(group=>{let rows=group.items.filter(d=>(d.join(' ')).toLowerCase().includes(filter.toLowerCase()));if(!rows.length)return;
 let h=document.createElement('div');h.className='category';h.textContent=group.group;oldList.append(h);
 rows.forEach(d=>{let el=document.createElement('div');el.className='doc'+(d===selected?' selected':'');el.innerHTML='<div class="docicon">'+d[0].slice(0,3).toUpperCase()+'</div><div><strong>'+d[0]+'</strong><small>'+d[4]+'</small></div>';el.onclick=()=>choose(d);oldList.append(el)})});
}
function choose(d){selected=d;$('kind').value=d[0];$('cw').value=d[2];$('ch').value=d[3];renderCatalog(search.value);if(active){active.w=d[2]*PX;active.h=d[3]*PX;render();syncControls?.()}}
flat.forEach(d=>{let o=document.createElement('option');o.value=d[0];o.textContent=d[0]+' — '+d[4];select.append(o)});
select.onchange=()=>choose(flat.find(d=>d[0]===select.value)||flat[0]);
search.oninput=()=>renderCatalog(search.value);renderCatalog();
function section(id,title){let s=document.createElement('div');s.className='section';s.id=id;s.innerHTML='<h3>'+title+'</h3>';document.querySelector('.right').append(s);return s}
const setup=section('catalogSetup','05 · INDIA CARD CATALOG');
setup.innerHTML+='<p class="tip">Choose the card profile first. Sizes marked suggested/custom must be checked against the original issuer document before printing.</p>';
const settings=section('productionSettings','06 · SHEET & FINISH SETTINGS');
settings.innerHTML+=`
<div class="field"><label>Number of Copies</label><input id="copyCount" type="number" min="1" max="100" step="1" value="1"></div>
<div class="field"><label>Card Gap (mm)</label><input id="cardGap" type="number" min="0" max="20" step=".5" value="3"></div>
<div class="field"><label>Card Corner</label><select id="cardCorner"><option value="original">Original Secure Corner</option><option value="rounded">PVC Rounded Corner · 3 mm</option></select></div>
<div class="field"><label>Sheet Orientation</label><select id="sheetOrientation"><option value="portrait">Portrait</option><option value="landscape">Landscape</option></select></div>
<div class="field"><label><input id="mirrorPrint" type="checkbox"> Mirror Print (optional)</label></div>
<div class="tip">Mouse wheel over Number of Copies changes count by one. Use Ctrl/⌘ + wheel for larger steps.</div>`;
const top=document.querySelector('.top');
const langButtons=document.createElement('div');langButtons.style.cssText='display:flex;gap:5px;margin-left:12px';
langButtons.innerHTML='<button class="btn" id="langEn">EN</button><button class="btn" id="langHi">हिंदी</button>';top.append(langButtons);
function setLang(v){lang=v;$('langEn').classList.toggle('primary',v==='en');$('langHi').classList.toggle('primary',v==='hi');
document.documentElement.lang=v==='hi'?'hi':'en';
document.querySelector('.sidehead h3').textContent=text('India Card Catalog','भारत का कार्ड कैटलॉग');
document.querySelector('.left .eyebrow').textContent=text('INDIA CARD CATALOG','इंडिया कार्ड कैटलॉग');
document.querySelector('.right .sidehead h3').textContent=text('Tools & Settings','टूल्स और सेटिंग');
document.querySelector('.workspacehead h2').textContent=text('A4 Print Preview','A4 प्रिंट प्रीव्यू');
document.querySelector('.workspacehead p').textContent=text('Cards are placed at physical millimetre dimensions','कार्ड वास्तविक मिलीमीटर आकार में शीट पर रखे जाते हैं');
document.querySelector('#catalogSetup h3').textContent=text('05 · INDIA CARD CATALOG','05 · इंडिया कार्ड कैटलॉग');
document.querySelector('#productionSettings h3').textContent=text('06 · SHEET & FINISH SETTINGS','06 · शीट और फिनिश सेटिंग');
$('copyCount').previousElementSibling.textContent=text('Number of Copies','कॉपी की संख्या');
$('cardGap').previousElementSibling.textContent=text('Card Gap (mm)','कार्ड गैप (mm)');
$('cardCorner').previousElementSibling.textContent=text('Card Corner','कार्ड कॉर्नर');
$('sheetOrientation').previousElementSibling.textContent=text('Sheet Orientation','शीट की दिशा');
$('mirrorPrint').parentElement.lastChild.textContent=' '+text('Mirror Print (optional)','मिरर प्रिंट (वैकल्पिक)');
renderCatalog(search.value);
}
$('langEn').onclick=()=>setLang('en');$('langHi').onclick=()=>setLang('hi');setLang('en');
const count=$('copyCount');count.addEventListener('wheel',e=>{e.preventDefault();count.value=Math.max(1,Math.min(100,(+count.value||1)+(e.deltaY<0?1:-1)*(e.ctrlKey?5:1)));copies=+count.value},{passive:false});
count.oninput=()=>copies=Math.max(1,Math.min(100,+count.value||1));
$('cardGap').oninput=e=>gap=Math.max(0,+e.target.value||0);
$('cardCorner').onchange=e=>corner=e.target.value;
$('sheetOrientation').onchange=e=>{ $('orientation').value=e.target.value;$('orientation').dispatchEvent(new Event('change'));const st=document.querySelector('#catalogPrintStyle');if(st)st.textContent='@page{size:A4 '+(e.target.value==='landscape'?'landscape':'portrait')+';margin:0}@media print{body.catalog-printing>*:not(#catalogPrintRoot){display:none!important}body.catalog-printing #catalogPrintRoot{display:block!important}#catalogPrintRoot .catalog-print-page:last-child{page-break-after:auto;break-after:auto}}'; };
$('mirrorPrint').onchange=e=>mirror=e.target.checked;
function mm(v){return v/PX}
function layoutAll(){
 if(!items.length)return;
 const landscape=$('sheetOrientation').value==='landscape',W=landscape?297:210,H=landscape?210:297,margin=5;
 const expanded=[];items.filter(it=>!it.generatedCopy).forEach(it=>{for(let n=0;n<copies;n++)expanded.push({...it,id:crypto.randomUUID(),sheet:0,generatedCopy:n>0})});
 const pages=[];
 expanded.forEach(it=>{let w=mm(it.w),h=mm(it.h);if(landscape&&w<h)[w,h]=[h,w];let placed=false;
 for(let p=0;p<pages.length&&!placed;p++){let page=pages[p],cols=Math.max(1,Math.floor((W-2*margin+gap)/(w+gap))),rows=Math.max(1,Math.floor((H-2*margin+gap)/(h+gap)));for(let k=0;k<cols*rows;k++){if(!page.used.has(k)){page.used.add(k);it.x=(margin+(k%cols)*(w+gap))*PX;it.y=(margin+Math.floor(k/cols)*(h+gap))*PX;it.w=w*PX;it.h=h*PX;it.sheet=p;page.items.push(it);placed=true;break}}}
 if(!placed){let page={items:[],used:new Set()};pages.push(page);let cols=Math.max(1,Math.floor((W-2*margin+gap)/(w+gap)));it.x=margin*PX;it.y=margin*PX;it.w=w*PX;it.h=h*PX;it.sheet=pages.length-1;page.used.add(0);page.items.push(it)}
 });
 items.splice(0,items.length,...expanded);active=items[0];window.render();{const n=document.getElementById('engineStatus');if(n)n.textContent='A4 layout: '+items.length+' copies across '+pages.length+' page(s).';}
}
const layoutBtn=document.createElement('button');layoutBtn.className='btn primary';layoutBtn.textContent='▦ Auto Arrange Copies';layoutBtn.onclick=layoutAll;document.querySelector('.toolbar').insertBefore(layoutBtn,document.querySelector('.toolbar .spacer'));
const oldPrint=$('print');oldPrint.onclick=()=>{
 layoutAll();const root=document.getElementById('catalogPrintRoot')||document.body.appendChild(document.createElement('div'));root.id='catalogPrintRoot';root.innerHTML='';
 const W=$('sheetOrientation').value==='landscape'?297:210,H=$('sheetOrientation').value==='landscape'?210:297;
 const max=Math.max(...items.map(i=>i.sheet||0),0);
 for(let p=0;p<=max;p++){let page=document.createElement('div');page.className='catalog-print-page';page.style.cssText='width:'+W+'mm;height:'+H+'mm;position:relative;overflow:hidden;page-break-after:always;break-after:page';
 items.filter(i=>(i.sheet||0)===p).forEach(it=>{let el=document.createElement('div');el.style.cssText='position:absolute;left:'+mm(it.x)+'mm;top:'+mm(it.y)+'mm;width:'+mm(it.w)+'mm;height:'+mm(it.h)+'mm;overflow:hidden;border-radius:'+(corner==='rounded'?'3mm':'0');
 let im=document.createElement('img');im.src=it.src;im.style.cssText='width:100%;height:100%;object-fit:fill;'+(mirror?'transform:scaleX(-1);':'');el.append(im);page.append(el)});root.append(page)}
 document.body.classList.add('catalog-printing');window.print();setTimeout(()=>document.body.classList.remove('catalog-printing'),800);
};
const css=document.createElement('style');css.id='catalogPrintStyle';css.textContent=`
#catalogPrintRoot{display:none}@media print{body.catalog-printing>*:not(#catalogPrintRoot){display:none!important}body.catalog-printing #catalogPrintRoot{display:block!important}#catalogPrintRoot .catalog-print-page:last-child{page-break-after:auto;break-after:auto}@page{size:A4;margin:0}}
`;document.head.append(css);
window.PVC_CATALOG={catalog,layoutAll,getSettings:()=>({copies,gap,corner,orientation:$('sheetOrientation').value,mirror})};
})();