import { useEffect, useMemo, useState } from 'react';
import AppShell from './components/AppShell';
import { PAGE_MAP } from './data/ia';
import { AppStateProvider, readIsLoggedIn } from './state/AppState';

const modules=import.meta.glob('./pages/**/*.jsx',{eager:true});
const ROUTES=Object.values(modules).reduce((all,mod)=>{all[mod.routeId]=mod.default;return all},{});
const defaultRoute=()=>readIsLoggedIn()?'story-home':'landing';
const readRoute=()=>{const id=location.hash.replace('#/','');return PAGE_MAP[id]?id:defaultRoute()};

export default function App(){
  const [pageId,setPageId]=useState(readRoute);
  useEffect(()=>{const onHash=()=>setPageId(readRoute());addEventListener('hashchange',onHash);return()=>removeEventListener('hashchange',onHash)},[]);
  const navigate=id=>{if(!PAGE_MAP[id])return;location.hash=`/${id}`;window.scrollTo({top:0,behavior:'smooth'})};
  const Page=useMemo(()=>ROUTES[pageId]||ROUTES[defaultRoute()],[pageId]);
  return <AppStateProvider><AppShell pageId={pageId} navigate={navigate}><Page navigate={navigate}/></AppShell></AppStateProvider>;
}
