import type { HostCountry, Stadium } from '../../../constants/mapHub';

type ClusterData = { id: string; name: string; lng: number; lat: number; color: string; count: number };
type StadiumData = { id: string; name: string; city: string; lng: number; lat: number };

/** HTML MapLibre GL + CARTO dark-matter — globe tournant, aucun token requis. */
export function buildMapLibreHubHtml(
  countries: readonly HostCountry[],
  stadiums: readonly Stadium[]
): string {
  const clusters: ClusterData[] = countries.map((c) => ({
    id: c.id, name: c.name,
    lng: c.coordinates[0], lat: c.coordinates[1],
    color: c.color, count: c.matchCount,
  }));
  const stData: StadiumData[] = stadiums.map((s) => ({
    id: s.id, name: s.name, city: s.city,
    lng: s.coordinates[0], lat: s.coordinates[1],
  }));
  const clustersJson = JSON.stringify(clusters);
  const stadiumsJson = JSON.stringify(stData);

  return `<!DOCTYPE html>
<html><head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no"/>
<link href="https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.css" rel="stylesheet"/>
<style>
  html,body{margin:0;padding:0;width:100%;height:100%;background:#0A0E1A;}
  #map{width:100%;height:100%;}
  .cluster{position:relative;min-width:40px;min-height:40px;border-radius:50%;display:flex;flex-direction:column;
    align-items:center;justify-content:center;font-family:-apple-system,system-ui,sans-serif;cursor:pointer;
    border:2px solid rgba(41, 121, 255, 0.55);background:rgba(41, 121, 255, 0.18);
    box-shadow:0 0 14px rgba(41, 121, 255, 0.35);transition:transform .15s;}
  .cluster:active{transform:scale(.9);}
  .cluster .n{font-size:16px;font-weight:800;color:#fff;z-index:2;line-height:1;}
  .cluster .t{font-size:8px;color:rgba(255,255,255,.85);margin-top:1px;z-index:2;text-align:center;padding:0 4px;white-space:nowrap;}
  .av-mk{display:flex;flex-direction:column;align-items:center;cursor:pointer;}
  .av-circle{width:40px;height:40px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:18px;border:2.5px solid #2979ff;background:#0f1623;box-shadow:0 0 10px rgba(41, 121, 255, 0.3);}
  .av-circle.me{width:52px;height:52px;border-color:#2979ff;box-shadow:0 0 20px rgba(41, 121, 255, 0.5);}
  .av-arrow{width:0;height:0;border-left:5px solid transparent;border-right:5px solid transparent;border-top:7px solid rgba(0,0,0,0.85);}
  .av-label{background:rgba(0,0,0,0.88);border-radius:6px;padding:2px 6px;font-size:7px;font-weight:800;color:#fff;white-space:nowrap;margin-top:2px;}
  .av-label.me-label{color:#2979ff;border:1px solid #2979ff;}
  .maplibregl-ctrl-bottom-right,.maplibregl-ctrl-bottom-left,.maplibregl-ctrl-attrib{display:none!important;}
</style>
</head><body>
<div id="map"></div>
<script src="https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.js"></script>
<script>
(function(){
  var CLUSTERS=${clustersJson};
  var STADIUMS_DATA=${stadiumsJson};
  var CENTROIDS={
    FR:[2.35,46.23],FRA:[2.35,46.23],BR:[-51.93,-14.24],BRA:[-51.93,-14.24],
    AR:[-63.62,-38.42],ARG:[-63.62,-38.42],ES:[-3.75,40.46],ESP:[-3.75,40.46],
    DE:[10.45,51.17],GER:[10.45,51.17],US:[-95.71,37.09],USA:[-95.71,37.09],
    MX:[-102.55,23.63],MEX:[-102.55,23.63],CA:[-96.80,56.13],CAN:[-96.80,56.13],
    JP:[138.25,36.20],JPN:[138.25,36.20],MA:[-7.09,31.79],MAR:[-7.09,31.79],
    SN:[-14.45,14.50],SEN:[-14.45,14.50],PT:[-8.22,39.40],POR:[-8.22,39.40],
    NL:[5.29,52.13],NED:[5.29,52.13],BE:[4.47,50.50],BEL:[4.47,50.50],
    UY:[-55.77,-32.52],URU:[-55.77,-32.52]
  };

  var map=new maplibregl.Map({
    container:'map',
    style:'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
    center:[-40,20],zoom:1.5,projection:'globe',attributionControl:false
  });

  function post(t,p){
    window.ReactNativeWebView&&window.ReactNativeWebView.postMessage(JSON.stringify({type:t,payload:p||{}}));
  }
  function emptyFC(){return{type:'FeatureCollection',features:[]};}

  var clusterMks=[];
  function buildClusterMarkers(){
    clusterMks.forEach(function(m){m.remove();});clusterMks=[];
    CLUSTERS.forEach(function(m){
      var el=document.createElement('div');
      el.className='cluster';
      el.innerHTML='<div class="n">'+m.count+'</div><div class="t">'+m.name+'</div>';
      el.onclick=function(e){e.stopPropagation();post('country',{id:m.id});};
      clusterMks.push(new maplibregl.Marker({element:el,anchor:'center'}).setLngLat([m.lng,m.lat]).addTo(map));
    });
  }
  function removeClusterMarkers(){clusterMks.forEach(function(m){m.remove();});clusterMks=[];}

  var avatarMks=[];
  function clearAvatars(){avatarMks.forEach(function(m){m.remove();});avatarMks=[];}

  function buildStadiumsFC(liveIds){
    liveIds=liveIds||[];
    return{type:'FeatureCollection',features:STADIUMS_DATA.map(function(s){
      return{type:'Feature',geometry:{type:'Point',coordinates:[s.lng,s.lat]},
        properties:{id:s.id,name:s.name,city:s.city,isLive:liveIds.indexOf(s.id)>=0}};
    })};
  }

  map.on('load',function(){
    try{map.setFog({
      color:'rgb(10,14,26)','high-color':'rgb(10,14,26)',
      'horizon-blend':0.02,'space-color':'rgb(10,14,26)','star-intensity':0.8
    });}catch(_){}

    map.addSource('tension-src',{type:'geojson',data:emptyFC()});
    map.addLayer({id:'tension-lines',type:'line',source:'tension-src',
      paint:{'line-color':'#2979ff','line-width':1.8,'line-opacity':0.75,'line-dasharray':[2,4]}
    });

    map.addSource('stadiums-src',{type:'geojson',data:buildStadiumsFC([])});
    map.addLayer({id:'stadiums-bg',type:'circle',source:'stadiums-src',
      paint:{
        'circle-radius':['case',['get','isLive'],9,6],
        'circle-color':['case',['get','isLive'],'#FF3B30','#2979ff'],
        'circle-opacity':0.9,
        'circle-stroke-width':2,'circle-stroke-color':'#fff','circle-stroke-opacity':0.9
      }
    });
    map.addLayer({id:'stadiums-ring',type:'circle',source:'stadiums-src',
      filter:['==',['get','isLive'],true],
      paint:{'circle-radius':16,'circle-color':'rgba(0,0,0,0)',
        'circle-stroke-width':2,'circle-stroke-color':'#FF3B30','circle-stroke-opacity':0.8}
    });
    map.addLayer({id:'stadiums-icon',type:'symbol',source:'stadiums-src',
      layout:{'text-field':['case',['get','isLive'],'⚽','🏟'],
        'text-size':12,'text-anchor':'top','text-offset':[0,0.9],
        'text-allow-overlap':false,'text-optional':true},
      paint:{'text-color':'#fff','text-opacity':0.9}
    });

    map.on('click','stadiums-bg',function(e){
      var f=e.features&&e.features[0];
      if(f)post('stadium',{id:f.properties.id});
    });
    map.on('mouseenter','stadiums-bg',function(){map.getCanvas().style.cursor='pointer';});
    map.on('mouseleave','stadiums-bg',function(){map.getCanvas().style.cursor='';});

    buildClusterMarkers();

    var pUp=true,pVal=0.3;
    (function animPulse(){
      pVal=pUp?pVal+0.04:pVal-0.04;
      if(pVal>=1)pUp=false; if(pVal<=0.1)pUp=true;
      try{map.setPaintProperty('stadiums-ring','circle-stroke-opacity',pVal);}catch(_){}
      requestAnimationFrame(animPulse);
    })();

    var dStep=0,dLast=0;
    var dSeq=[[0,4,3],[0.5,4,2.5],[1,4,2],[1.5,4,1.5],[2,4,1],[2.5,4,0.5],[3,4,0],[0,0.5,3,3.5],[0,1,3,3],[0,1.5,3,2.5],[0,2,3,2],[0,2.5,3,1.5],[0,3,3,1],[0,3.5,3,0.5]];
    (function animDash(ts){
      if(ts-dLast>55){
        try{map.setPaintProperty('tension-lines','line-dasharray',dSeq[dStep%dSeq.length]);}catch(_){}
        dStep++;dLast=ts;
      }
      requestAnimationFrame(animDash);
    })(0);

    // Rotation globe
    var isUserInteracting=false;
    map.on('mousedown',function(){isUserInteracting=true;});
    map.on('mouseup',function(){isUserInteracting=false;});
    map.on('dragend',function(){isUserInteracting=false;});
    map.on('touchstart',function(){isUserInteracting=true;});
    map.on('touchend',function(){isUserInteracting=false;});
    (function rotateGlobe(){
      if(!isUserInteracting){
        var c=map.getCenter();c.lng-=0.08;
        map.easeTo({center:c,duration:100,easing:function(n){return n;}});
      }
      requestAnimationFrame(rotateGlobe);
    })();

    post('ready',{});post('MAP_READY',{});
    setTimeout(function(){try{map.resize();}catch(_){}},300);
  });

  window.__goalyaEnterCountry=function(id){
    var m=CLUSTERS.find(function(x){return x.id===id;});
    if(!m)return;
    removeClusterMarkers();
    map.flyTo({center:[m.lng,m.lat],zoom:4.4,duration:1400,essential:true});
  };
  window.__goalyaWorld=function(){
    map.flyTo({center:[-40,20],zoom:1.5,duration:1200,essential:true});
    map.once('moveend',function(){buildClusterMarkers();});
  };
  window.__goalyaFlyToNation=function(code){
    var c=CENTROIDS[code];if(!c)return;
    map.flyTo({center:c,zoom:4,duration:1500,essential:true});
  };
  window.__goalyaUpdateLiveMatches=function(matches){
    if(!map||!map.getSource)return;
    var liveIds=matches.filter(function(m){return m.isLive;}).map(function(m){return m.stadiumId;});
    var lineFeatures=[];
    matches.forEach(function(m){
      if(!m.isLive)return;
      var hc=CENTROIDS[m.homeCode],ac=CENTROIDS[m.awayCode];
      var st=STADIUMS_DATA.find(function(s){return s.id===m.stadiumId;});
      if(!hc||!ac||!st)return;
      lineFeatures.push({type:'Feature',
        geometry:{type:'LineString',coordinates:[hc,[st.lng,st.lat],ac]},properties:{}});
    });
    try{map.getSource('tension-src').setData({type:'FeatureCollection',features:lineFeatures});}catch(_){}
    try{map.getSource('stadiums-src').setData(buildStadiumsFC(liveIds));}catch(_){}
  };
  window.__goalyaUpdateAvatars=function(avatars){
    clearAvatars();
    avatars.forEach(function(a){
      var el=document.createElement('div');
      el.className='av-mk';
      var isMe=!!a.isMe;
      if(a.muted) el.style.opacity='0.32';
      var rank=a.rank||'';
      var border=rank==='Capitaine'?'#2979ff':rank==='Vétéran'?'#bfa968':'#2979ff';
      var label=isMe?('MOI · '+(a.name||'')):(a.country?a.country+' · '+rank:rank||a.name||'');
      el.innerHTML=
        '<div class="av-circle'+(isMe?' me':'')+'" style="border-color:'+border+'">'+
          (a.flag||'👤')+
        '</div>'+
        '<div class="av-arrow"></div>'+
        '<div class="av-label'+(isMe?' me-label':'')+'">'+label+'</div>';
      var offset=function(b){return b+(Math.random()-0.5)*2;};
      avatarMks.push(
        new maplibregl.Marker({element:el,anchor:'bottom'})
          .setLngLat([offset(a.lng),offset(a.lat)]).addTo(map)
      );
    });
  };
  window.__goalyaUpdateSupporters=function(){};

  map.on('error',function(e){post('map_error',{message:(e&&e.error&&e.error.message)||'map error'});});
})();
</script>
</body></html>`;
}
