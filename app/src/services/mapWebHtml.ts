/** HTML Mapbox GL — globe Mind 2.0 (cockpit supporter). */
import { COUNTRY_CENTROIDS, COUNTRY_ZOOM, GLOBE_CODE_ALIASES, NATION_COLORS } from '../constants/hubGlobe';

export function buildMindGlobeHtml(mapboxToken: string): string {
  const tokenJson = JSON.stringify(mapboxToken);
  return `<!DOCTYPE html>
<html><head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no"/>
<link href="https://api.mapbox.com/mapbox-gl-js/v3.8.0/mapbox-gl.css" rel="stylesheet"/>
<style>
  html,body,#map{margin:0;padding:0;width:100%;height:100%;background:#050810;}
  @keyframes pulseRing{0%{transform:scale(0.85);opacity:0.85;}100%{transform:scale(1.8);opacity:0;}}
  @keyframes aiPulse{0%,100%{transform:scale(1);opacity:1;}50%{transform:scale(1.12);opacity:0.85;}}
  @keyframes reactionFly{0%{transform:translateY(0);opacity:0;}15%{opacity:1;}100%{transform:translateY(-80px);opacity:0;}}
  .st-mk{display:flex;flex-direction:column;align-items:center;cursor:pointer;}
  .st-dot{width:16px;height:16px;border-radius:50%;border:2px solid #fff;}
  .st-dot.live{width:20px;height:20px;background:#FF3B30;border-color:#fff;position:relative;}
  .st-dot.live:before,.st-dot.live:after{content:'';position:absolute;inset:-6px;border-radius:50%;border:2px solid rgba(255,59,48,0.55);animation:pulseRing 1.5s ease-out infinite;}
  .st-dot.live:after{animation-delay:0.75s;}
  .st-dot.upcoming{background:#2979ff;}
  .st-dot.done{background:#6B7280;opacity:0.5;}
  .st-label{margin-top:4px;font-size:8px;font-weight:800;padding:2px 6px;border-radius:6px;background:rgba(0,0,0,0.88);color:#fff;white-space:nowrap;}
  .st-label.live{color:#FF3B30;}
  .st-label.upcoming{color:#2979ff;}
  .av-mk{display:flex;flex-direction:column;align-items:center;cursor:pointer;}
  .av-circle{width:44px;height:44px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:18px;border:2.5px solid #2979ff;background:#111827;position:relative;}
  .av-circle.me{width:52px;height:52px;border-width:3px;box-shadow:0 0 20px rgba(41, 121, 255, 0.6);}
  .av-badge{position:absolute;top:-4px;right:-4px;font-size:7px;font-weight:900;padding:1px 4px;border-radius:8px;color:#000;}
  .av-arrow{width:0;height:0;border-left:5px solid transparent;border-right:5px solid transparent;border-top:7px solid rgba(0,0,0,0.9);}
  .av-label{margin-top:2px;background:rgba(0,0,0,0.9);border-radius:6px;padding:2px 6px;font-size:7px;font-weight:800;color:#fff;white-space:nowrap;}
  .av-label.me{color:#2979ff;}
  .ai-mk{position:relative;width:20px;height:20px;}
  .ai-core{width:14px;height:14px;border-radius:50%;background:radial-gradient(circle,#5b9aff 0%,#2979ff 70%);box-shadow:0 0 0 4px rgba(41, 121, 255, 0.12),0 0 16px rgba(41, 121, 255, 0.32);animation:aiPulse 1s ease-in-out infinite;margin:3px;}
  .ai-halo{position:absolute;inset:-13px;border-radius:50%;background:radial-gradient(circle,rgba(41, 121, 255, 0.15) 0%,transparent 70%);}
  .ai-label{position:absolute;top:-18px;left:50%;transform:translateX(-50%);background:rgba(41, 121, 255, 0.15);border:1px solid rgba(41, 121, 255, 0.4);border-radius:10px;padding:2px 8px;font-size:7px;font-weight:800;color:#5b9aff;white-space:nowrap;}
  .rx{position:absolute;font-size:22px;animation:reactionFly 2.5s ease-out forwards;pointer-events:none;}
  .mapboxgl-ctrl-bottom-right,.mapboxgl-ctrl-bottom-left,.mapboxgl-ctrl-attrib{display:none!important;}
</style></head><body>
<div id="map"></div>
<script src="https://api.mapbox.com/mapbox-gl-js/v3.8.0/mapbox-gl.js"></script>
<script>
(function(){
  mapboxgl.accessToken=${tokenJson};
  var map=new mapboxgl.Map({container:'map',style:'mapbox://styles/mapbox/dark-v11',center:[-40,20],zoom:1.5,projection:'globe',attributionControl:false});
  var STADIUMS=[
    {id:'metlife',name:'MetLife Stadium',city:'New York',coords:[-74.0745,40.8135]},
    {id:'sofi',name:'SoFi Stadium',city:'Los Angeles',coords:[-118.3378,33.9535]},
    {id:'hardrock',name:'Hard Rock Stadium',city:'Miami',coords:[-80.2388,25.9580]},
    {id:'att',name:'AT&T Stadium',city:'Dallas',coords:[-97.0931,32.7480]},
    {id:'levis',name:'Levi Stadium',city:'San Francisco',coords:[-121.9696,37.4033]},
    {id:'seattle',name:'Lumen Field',city:'Seattle',coords:[-122.3317,47.5952]},
    {id:'azteca',name:'Estadio Azteca',city:'Mexico City',coords:[-99.1500,19.3030]},
    {id:'bmc',name:'BMO Field',city:'Toronto',coords:[-79.4187,43.6333]}
  ];
  var NATION_SPAWN={FRA:[2.3522,46.2276],FR:[2.3522,46.2276],BRA:[-51.9253,-14.2350],BR:[-51.9253,-14.2350],ARG:[-63.6167,-38.4161],AR:[-63.6167,-38.4161],ESP:[-3.7492,40.4637],ES:[-3.7492,40.4637],GER:[10.4515,51.1657],DE:[10.4515,51.1657],ENG:[-1.1743,52.3555],GB:[-1.1743,52.3555],USA:[-95.7129,37.0902],US:[-95.7129,37.0902],MEX:[-102.5528,23.6345],MX:[-102.5528,23.6345],CAN:[-96.7969,56.1304],CA:[-96.7969,56.1304],JPN:[138.2529,36.2048],JP:[138.2529,36.2048],SEN:[-14.4524,14.4974],SN:[-14.4524,14.4974],MAR:[-7.0926,31.7917],MA:[-7.0926,31.7917]};
  function post(type,data){window.ReactNativeWebView&&window.ReactNativeWebView.postMessage(JSON.stringify({type:type,data:data||{}}));}
  var stadiumMks=[],avatarMks=[],aiMk=null,reactionMks=[];
  function clearStadiums(){stadiumMks.forEach(function(m){m.remove();});stadiumMks=[];}
  function clearAvatars(){avatarMks.forEach(function(m){m.remove();});avatarMks=[];}
  function rankColor(rank){if(rank==='Capitaine')return '#2979ff';if(rank==='Vétéran')return '#bfa968';return '#2979ff';}
  function renderStadiums(list){
    clearStadiums();
  (list||STADIUMS).forEach(function(s){
      var status=s.status||'upcoming';
      var el=document.createElement('div');el.className='st-mk';
      el.innerHTML='<div class="st-dot '+status+'"></div><div class="st-label '+status+'">'+s.name+'</div>';
      el.onclick=function(e){e.stopPropagation();post('STADIUM_TAP',{stadiumId:s.id,matchData:s.matchData||null});};
      stadiumMks.push(new mapboxgl.Marker({element:el,anchor:'bottom'}).setLngLat(s.coords).addTo(map));
    });
  }
  window.__goalyaUpdateStadiums=function(list){renderStadiums(list);};
  window.__goalyaUpdateAvatars=function(avatars){
    clearAvatars();
    (avatars||[]).forEach(function(a){
      var el=document.createElement('div');el.className='av-mk';
      if(a.muted) el.style.opacity='0.25';
      var isMe=!!a.isMe;
      var border=rankColor(a.rank||'');
      var label=isMe?('MOI · '+(a.name||'')):((a.country||'')+' · '+(a.rank||a.name||''));
      el.innerHTML='<div class="av-circle'+(isMe?' me':'')+'" style="border-color:'+border+'">'+(a.flag||'👤')+'<span class="av-badge" style="background:'+border+'">'+(a.count||'')+'</span></div><div class="av-arrow"></div><div class="av-label'+(isMe?' me':'')+'">'+label+'</div>';
      var off=function(b){return b+(Math.random()-0.5)*4;};
      avatarMks.push(new mapboxgl.Marker({element:el,anchor:'bottom'}).setLngLat([off(a.lng),off(a.lat)]).addTo(map));
    });
  };
  window.__goalyaUpdateHeat=function(items){
    if(!map.getSource('nations-heat'))return;
    var features=(items||[]).map(function(it){
      return {type:'Feature',geometry:{type:'Point',coordinates:[it.lng,it.lat]},properties:{supporters:it.supporters||1}};
    });
    map.getSource('nations-heat').setData({type:'FeatureCollection',features:features});
  };
  window.__goalyaFlyToNation=function(code){
    var c=NATION_SPAWN[code];if(!c)return;
    map.flyTo({center:c,zoom:4,duration:1500,essential:true});
  };
  window.__goalyaWorld=function(){map.flyTo({center:[-40,20],zoom:1.5,duration:1200,essential:true});};
  window.__goalyaSpawnReaction=function(payload){
    var code=payload&&payload.countryCode;var emoji=payload&&payload.emoji;var c=NATION_SPAWN[code]||[-40,20];
    var el=document.createElement('div');el.className='rx';el.textContent=emoji||'🔥';
    var mk=new mapboxgl.Marker({element:el,anchor:'center'}).setLngLat(c).addTo(map);
    reactionMks.push(mk);
    setTimeout(function(){mk.remove();},2600);
  };
  function placeAi(lng,lat){
    if(aiMk) aiMk.remove();
    var el=document.createElement('div');el.className='ai-mk';
    el.innerHTML='<div class="ai-halo"></div><div class="ai-core"></div><div class="ai-label">AGENT IA</div>';
    aiMk=new mapboxgl.Marker({element:el,anchor:'center'}).setLngLat([lng,lat]).addTo(map);
  }
  function randomAiMove(){
    var active=STADIUMS.filter(function(s){return s.status==='live';});
    var pool=active.length?active:STADIUMS;
    var pick=pool[Math.floor(Math.random()*pool.length)];
    var lng=pick.coords[0]+(Math.random()-0.5)*2;
    var lat=pick.coords[1]+(Math.random()-0.5)*2;
    placeAi(lng,lat);
  }
  map.on('load',function(){
    try{map.setFog({color:'rgb(5,8,16)','high-color':'rgb(5,8,16)','horizon-blend':0.02,'star-intensity':0.85});}catch(_){}
    map.addSource('nations-heat',{type:'geojson',data:{type:'FeatureCollection',features:[]}});
    map.addLayer({id:'nations-heatmap',type:'heatmap',source:'nations-heat',paint:{
      'heatmap-weight':['get','supporters'],
      'heatmap-intensity':0.7,
      'heatmap-color':['interpolate',['linear'],['heatmap-density'],0,'rgba(41, 121, 255, 0)',0.4,'rgba(41, 121, 255, 0.18)',1,'rgba(41, 121, 255, 0.38)'],
      'heatmap-radius':45,
      'heatmap-opacity':0.75
    }});
    renderStadiums(STADIUMS.map(function(s){return Object.assign({},s,{status:'upcoming'});}));
    var userInteracting=false;
    map.on('mousedown',function(){userInteracting=true;});
    map.on('mouseup',function(){userInteracting=false;});
    map.on('touchstart',function(){userInteracting=true;});
    map.on('touchend',function(){userInteracting=false;});
    (function rotateGlobe(){
      if(!userInteracting){var c=map.getCenter();c.lng-=0.06;map.easeTo({center:c,duration:100,easing:function(t){return t;}});}
      requestAnimationFrame(rotateGlobe);
    })();
    randomAiMove();
    setInterval(randomAiMove,8000);
    post('MAP_READY',{});
    setTimeout(function(){try{map.resize();}catch(_){}},300);
  });
  map.on('error',function(e){post('MAP_ERROR',{message:(e&&e.error&&e.error.message)||'map error'});});
})();
</script></body></html>`;
}

/** HTML Mapbox GL — globe Hub (foule mondiale, heatmap + pulse). */
export function buildHubGlobeHtml(mapboxToken: string): string {
  const tokenJson = JSON.stringify(mapboxToken);
  const centroidsJson = JSON.stringify(COUNTRY_CENTROIDS);
  const zoomJson = JSON.stringify(COUNTRY_ZOOM);
  const aliasesJson = JSON.stringify(GLOBE_CODE_ALIASES);
  const colorsJson = JSON.stringify(NATION_COLORS);
  return `<!DOCTYPE html>
<html><head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no"/>
<link href="https://api.mapbox.com/mapbox-gl-js/v3.8.0/mapbox-gl.css" rel="stylesheet"/>
<style>
  html,body,#map{margin:0;padding:0;width:100%;height:100%;background:#0A0E1A;}
  .mapboxgl-ctrl-bottom-right,.mapboxgl-ctrl-bottom-left,.mapboxgl-ctrl-attrib{display:none!important;}
  @keyframes flashOut{from{opacity:1;}to{opacity:0;}}
  @keyframes mapShake{0%,100%{transform:translateX(0);}20%{transform:translateX(-3px) rotate(0.3deg);}40%{transform:translateX(3px) rotate(-0.3deg);}60%{transform:translateX(-2px);}80%{transform:translateX(2px);}}
  @keyframes heartbeat{0%,100%{opacity:0.35;}50%{opacity:1;}}
</style></head><body>
<div id="map"></div>
<script src="https://api.mapbox.com/mapbox-gl-js/v3.8.0/mapbox-gl.js"></script>
<script>
(function(){
  mapboxgl.accessToken=${tokenJson};
  var COUNTRY_CENTROIDS=${centroidsJson};
  var COUNTRY_ZOOM=${zoomJson};
  var CODE_ALIASES=${aliasesJson};
  var NATION_COLORS=${colorsJson};
  var map=new mapboxgl.Map({container:'map',style:'mapbox://styles/mapbox/dark-v11',center:[-40,20],zoom:1.5,projection:'globe',attributionControl:false});
  var avatarMks=[],chaosTimer=null,penaltyDots=[],nationMode=false,nationFilterCode=null,highlightPulseTimer=null,userInteracting=false;
  var ACTIVE_CITIES=[[2.35,48.85],[-43.2,-22.9],[-99.13,19.43]];
  function post(type,data){window.ReactNativeWebView&&window.ReactNativeWebView.postMessage(JSON.stringify({type:type,data:data||{}}));}
  function normalizeCode(code){if(!code)return '';var u=String(code).toUpperCase();if(COUNTRY_CENTROIDS[u])return u;var a=CODE_ALIASES[u];return a&&COUNTRY_CENTROIDS[a]?a:u;}
  function clearAvatars(){avatarMks.forEach(function(m){m.remove();});avatarMks=[];}
  function renderAvatars(list,filterCode){
    clearAvatars();
    var fc=filterCode?normalizeCode(filterCode):'';
    var rows=fc?(list||[]).filter(function(s){return normalizeCode(s.country)===fc;}):(list||[]);
    rows.forEach(function(s){
      var el=document.createElement('div');
      el.innerHTML='<div style="width:28px;height:28px;border-radius:50%;border:2px solid '+(s.color||'#2979ff')+';background:rgba(17,24,39,0.9);display:flex;align-items:center;justify-content:center;font-size:14px;box-shadow:0 0 8px '+(s.color||'#2979ff')+'44;">'+(s.flag||'👤')+'</div><div style="font-size:8px;color:rgba(255,255,255,0.7);background:rgba(0,0,0,0.6);border-radius:4px;padding:1px 4px;text-align:center;margin-top:2px;white-space:nowrap;">'+(s.username||'')+'</div>';
      avatarMks.push(new mapboxgl.Marker({element:el,anchor:'center'}).setLngLat([s.lng,s.lat]).addTo(map));
    });
  }
  function updateHeatmap(geojson){
    if(!map.getSource('supporters-source'))return;
    map.getSource('supporters-source').setData(geojson||{type:'FeatureCollection',features:[]});
  }
  function createWave(coords,color,opacity,speed){
    if(!coords)return;
    var id='wave-'+Date.now()+'-'+Math.random().toString(36).slice(2,5);
    map.addSource(id,{type:'geojson',data:{type:'Feature',geometry:{type:'Point',coordinates:coords}}});
    map.addLayer({id:id,type:'circle',source:id,paint:{'circle-radius':0,'circle-color':color||'#2979ff','circle-opacity':opacity||0.6,'circle-stroke-width':2,'circle-stroke-color':color||'#2979ff','circle-stroke-opacity':opacity||0.6}});
    var r=0,o=opacity||0.6,step=speed||6,decay=0.022;
    var t=setInterval(function(){r+=step;o-=decay;if(o<=0){clearInterval(t);try{map.removeLayer(id);map.removeSource(id);}catch(_){}}map.setPaintProperty(id,'circle-radius',r);map.setPaintProperty(id,'circle-stroke-opacity',o);},30);
  }
  function nationPulse(country,color){createWave(COUNTRY_CENTROIDS[country],color||'#2979ff',0.6,6);}
  function flashScreen(strong){var flash=document.createElement('div');flash.style.cssText='position:fixed;inset:0;z-index:999;background:rgba(255,255,255,'+(strong?0.32:0.12)+');pointer-events:none;animation:flashOut 0.65s ease-out forwards';document.body.appendChild(flash);setTimeout(function(){flash.remove();},650);}
  function shakeMap(){try{var canvas=map.getCanvas();var seq=[7,-7,6,-6,5,-5,3,-3,0];var i=0;var step=function(){if(i>=seq.length){canvas.style.transform='';return;}canvas.style.transform='translateX('+seq[i]+'px) rotate('+(seq[i]*0.07)+'deg)';i++;setTimeout(step,52);};step();}catch(_){}}
  var livePulseTimer=null,celebratingCountries=[];
  function ensureNightLayer(){if(map.getSource('night-zones'))return;map.addSource('night-zones',{type:'geojson',data:{type:'FeatureCollection',features:[]}});map.addLayer({id:'night-fill',type:'circle',source:'night-zones',paint:{'circle-radius':['interpolate',['linear'],['zoom'],1,38,4,95,6,150],'circle-color':'#040818','circle-opacity':['get','opacity'],'circle-blur':0.4}});}
  function ensureLiveLayer(){if(map.getSource('live-zones'))return;map.addSource('live-zones',{type:'geojson',data:{type:'FeatureCollection',features:[]}});map.addLayer({id:'live-pulse',type:'circle',source:'live-zones',paint:{'circle-radius':52,'circle-color':'#2979ff','circle-opacity':0.24,'circle-stroke-width':2.5,'circle-stroke-color':'#5b9aff','circle-stroke-opacity':0.85}});}
  function updateDayNight(nightFeatures){ensureNightLayer();map.getSource('night-zones').setData({type:'FeatureCollection',features:nightFeatures||[]});}
  function updateLiveMatches(countries){ensureLiveLayer();var feats=(countries||[]).map(function(code){code=normalizeCode(code);var c=COUNTRY_CENTROIDS[code];if(!c)return null;return {type:'Feature',geometry:{type:'Point',coordinates:c},properties:{code:code}};}).filter(Boolean);map.getSource('live-zones').setData({type:'FeatureCollection',features:feats});if(livePulseTimer)clearInterval(livePulseTimer);var pulse=0;livePulseTimer=setInterval(function(){pulse+=0.1;var r=50+Math.sin(pulse)*12;try{map.setPaintProperty('live-pulse','circle-radius',r);map.setPaintProperty('live-pulse','circle-opacity',0.2+Math.sin(pulse)*0.1);}catch(_){}},85);}
  function startCelebration(code,color){code=normalizeCode(code);if(!code||celebratingCountries.indexOf(code)>=0)return;celebratingCountries.push(code);handlePlanetEvent({type:'GOAL',country:code,countryColor:color||NATION_COLORS[code]});setTimeout(function(){celebratingCountries=celebratingCountries.filter(function(c){return c!==code;});},8000);}
  function clearPenaltyDots(){penaltyDots.forEach(function(m){m.remove();});penaltyDots=[];}
  function startPenaltyMode(){var vignette=document.getElementById('penalty-vignette');if(!vignette){vignette=document.createElement('div');vignette.id='penalty-vignette';vignette.style.cssText='position:fixed;inset:0;z-index:50;pointer-events:none;background:radial-gradient(ellipse at center,transparent 50%,rgba(255,30,30,0.25) 100%);animation:heartbeat 0.9s ease-in-out infinite';document.body.appendChild(vignette);}clearPenaltyDots();ACTIVE_CITIES.forEach(function(coords){var el=document.createElement('div');el.style.cssText='width:10px;height:10px;border-radius:50%;background:#FF3B30;box-shadow:0 0 10px #FF3B30;animation:heartbeat 0.9s infinite';penaltyDots.push(new mapboxgl.Marker({element:el,anchor:'center'}).setLngLat(coords).addTo(map));});}
  function endPenaltyMode(){document.getElementById('penalty-vignette')?.remove();clearPenaltyDots();}
  function handlePlanetEvent(event){if(!event||!event.type)return;var country=normalizeCode(event.country),color=event.countryColor||NATION_COLORS[country]||'#2979ff';if(event.type==='GOAL'){for(var i=0;i<5;i++){setTimeout(function(ii){return function(){createWave(COUNTRY_CENTROIDS[country],color,0.85-ii*0.12,8);};}(i),i*240);}flashScreen(true);shakeMap();handleGoalRingGlow(color);}if(event.type==='RED_CARD'){setTimeout(function(){createWave(COUNTRY_CENTROIDS[country],'#FF3B30',1,8);},1500);}if(event.type==='PENALTY')startPenaltyMode();if(event.type==='PENALTY_MISSED')endPenaltyMode();if(event.type==='HISTORIC'){Object.keys(COUNTRY_CENTROIDS).forEach(function(code,i){setTimeout(function(){createWave(COUNTRY_CENTROIDS[code],NATION_COLORS[code]||'#FFFFFF',0.35,5);},i*100);});}}
  function handleReactionWave(countries){(countries||[]).forEach(function(code,i){setTimeout(function(){createWave(COUNTRY_CENTROIDS[code],NATION_COLORS[code]||'#FFD700',0.45,5);},i*180);});}
  function handleChaosMode(active){if(!active){if(chaosTimer){clearInterval(chaosTimer);chaosTimer=null;}document.getElementById('chaos-overlay')?.remove();return;}if(!document.getElementById('chaos-overlay')){var hb=document.createElement('div');hb.id='chaos-overlay';hb.style.cssText='position:fixed;inset:0;z-index:35;pointer-events:none;background:radial-gradient(ellipse at center,transparent 40%,rgba(255,0,0,0.12) 100%);animation:heartbeat 0.8s ease-in-out infinite';document.body.appendChild(hb);}if(chaosTimer)return;var nations=Object.keys(COUNTRY_CENTROIDS);chaosTimer=setInterval(function(){var code=nations[Math.floor(Math.random()*nations.length)];createWave(COUNTRY_CENTROIDS[code],'#FF3B30',0.3,4);},700);}
  function handleGoalWaves(country,color){for(var i=0;i<3;i++){setTimeout(function(ii){return function(){createWave(COUNTRY_CENTROIDS[country],color||'#2979ff',0.8-ii*0.15,7);};}(i),i*280);}}
  function handleWeatherMood(mood){var fog={normal:{color:'rgb(5,8,16)',stars:0.85,heat:0.85},tense:{color:'#0a0a12',stars:0.3,heat:0.5},electric:{color:'#030d10',stars:1,heat:1},dramatic:{color:'#080008',stars:0.2,heat:0.8}};var cfg=fog[mood]||fog.normal;try{map.setFog({color:cfg.color,'high-color':cfg.color,'horizon-blend':0.02,'star-intensity':cfg.stars});}catch(_){}if(map.getLayer('nations-heatmap'))map.setPaintProperty('nations-heatmap','heatmap-opacity',cfg.heat);}
  function handleGoalRingGlow(color){var ring=document.getElementById('globe-ring');if(!ring){ring=document.createElement('div');ring.id='globe-ring';ring.style.cssText='position:fixed;inset:12px;border-radius:999px;pointer-events:none;z-index:12;border:2px solid transparent';document.body.appendChild(ring);}ring.style.borderColor=color||'#2979ff';ring.style.boxShadow='0 0 28px '+(color||'#2979ff')+'33';setTimeout(function(){ring.style.borderColor='transparent';ring.style.boxShadow='none';},3000);}
  function clearNationHighlight(){if(highlightPulseTimer){clearInterval(highlightPulseTimer);highlightPulseTimer=null;}try{map.removeLayer('nation-hl-ring');map.removeLayer('nation-hl-glow');map.removeSource('nation-hl');}catch(_){}}
  function setNationHighlight(code){
    clearNationHighlight();
    code=normalizeCode(code);
    var c=COUNTRY_CENTROIDS[code];
    if(!c||!map.getSource)return;
    var color=NATION_COLORS[code]||'#2979ff';
    map.addSource('nation-hl',{type:'geojson',data:{type:'Feature',geometry:{type:'Point',coordinates:c}}});
    map.addLayer({id:'nation-hl-glow',type:'circle',source:'nation-hl',paint:{'circle-radius':72,'circle-color':'#2979ff','circle-opacity':0.28,'circle-blur':0.45}});
    map.addLayer({id:'nation-hl-ring',type:'circle',source:'nation-hl',paint:{'circle-radius':48,'circle-color':color,'circle-opacity':0.12,'circle-stroke-width':2.5,'circle-stroke-color':'#f0b429','circle-stroke-opacity':0.85}});
    var pulse=0;
    highlightPulseTimer=setInterval(function(){
      if(!nationMode){clearNationHighlight();return;}
      pulse+=0.09;
      var r=44+Math.sin(pulse)*14;
      try{map.setPaintProperty('nation-hl-glow','circle-radius',r*1.55);map.setPaintProperty('nation-hl-ring','circle-radius',r);}catch(_){clearNationHighlight();}
    },55);
  }
  function setNationMode(active,code){
    nationMode=!!active;
    nationFilterCode=active?normalizeCode(code):null;
    if(active)setNationHighlight(nationFilterCode);else clearNationHighlight();
  }
  function flyNation(code){
    code=normalizeCode(code);
    var c=COUNTRY_CENTROIDS[code];
    if(!c)return;
    var z=(COUNTRY_ZOOM&&COUNTRY_ZOOM[code])||4;
    var color=NATION_COLORS[code]||'#2979ff';
    userInteracting=true;
    setNationMode(true,code);
    map.flyTo({center:c,zoom:z,pitch:28,bearing:0,duration:2000,essential:true,curve:1.42});
    setTimeout(function(){createWave(c,color,0.55,6);createWave(c,'#f0b429',0.4,5);post('NATION_FLY_COMPLETE',{country:code});},1900);
    setTimeout(function(){if(nationMode)userInteracting=false;},2400);
  }
  function flyWorld(){
    setNationMode(false);
    userInteracting=true;
    map.flyTo({center:[-40,20],zoom:1.5,pitch:0,bearing:0,duration:1500,essential:true,curve:1.2});
    setTimeout(function(){userInteracting=false;},1600);
  }
  function onHostMessage(raw){
    try{
      var data=typeof raw==='string'?JSON.parse(raw):raw;
      if(!data||!data.type)return;
      if(data.type==='UPDATE_AVATARS')renderAvatars(data.supporters,nationMode?nationFilterCode:null);
      if(data.type==='SET_NATION_MODE'){if(data.active){setNationMode(true,data.country);}else{setNationMode(false);}}
      if(data.type==='UPDATE_HEATMAP')updateHeatmap(data.geojson);
      if(data.type==='NATION_PULSE')nationPulse(data.country,data.color);
      if(data.type==='PLANET_EVENT')handlePlanetEvent(data.event);
      if(data.type==='REACTION_WAVE')handleReactionWave(data.countries);
      if(data.type==='CHAOS_MODE')handleChaosMode(!!data.active);
      if(data.type==='WEATHER_MOOD')handleWeatherMood(data.mood);
      if(data.type==='GOAL_WAVES'||data.type==='GOAL_EFFECT')handleGoalWaves(data.country,data.color);
      if(data.type==='GOAL_RING_GLOW')handleGoalRingGlow(data.color);
      if(data.type==='FLY_NATION')flyNation(data.country);
      if(data.type==='FLY_WORLD')flyWorld();
      if(data.type==='UPDATE_DAY_NIGHT')updateDayNight(data.nightFeatures);
      if(data.type==='UPDATE_LIVE_MATCHES')updateLiveMatches(data.countries);
      if(data.type==='CELEBRATION_START')startCelebration(data.country,data.color);
    }catch(_){}
  }
  document.addEventListener('message',function(e){onHostMessage(e.data);});
  window.addEventListener('message',function(e){onHostMessage(e.data);});
  map.on('load',function(){
    try{map.setFog({color:'rgb(5,8,16)','high-color':'rgb(5,8,16)','horizon-blend':0.02,'star-intensity':0.85});}catch(_){}
    map.addSource('supporters-source',{type:'geojson',data:{type:'FeatureCollection',features:[]}});
    map.addLayer({id:'nations-heatmap',type:'heatmap',source:'supporters-source',paint:{
      'heatmap-weight':['get','intensity'],
      'heatmap-intensity':['interpolate',['linear'],['zoom'],0,1,9,3],
      'heatmap-color':['interpolate',['linear'],['heatmap-density'],0,'rgba(0,0,0,0)',0.5,['get','countryColor'],1,'#FFFFFF'],
      'heatmap-radius':['interpolate',['linear'],['zoom'],0,40,9,80],
      'heatmap-opacity':0.85
    }});
    ensureNightLayer();
    ensureLiveLayer();
    map.on('mousedown',function(){userInteracting=true;});
    map.on('mouseup',function(){userInteracting=false;});
    map.on('touchstart',function(){userInteracting=true;});
    map.on('touchend',function(){userInteracting=false;});
    (function rotateGlobe(){
      if(!userInteracting&&!nationMode){var c=map.getCenter();c.lng-=0.06;map.easeTo({center:c,duration:100,easing:function(t){return t;}});}
      requestAnimationFrame(rotateGlobe);
    })();
    post('MAP_READY',{});
    setTimeout(function(){try{map.resize();}catch(_){}},300);
  });
  map.on('error',function(e){post('MAP_ERROR',{message:(e&&e.error&&e.error.message)||'map error'});});
})();
</script></body></html>`;
}
