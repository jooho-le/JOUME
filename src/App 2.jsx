import { useEffect, useMemo, useState } from 'react';
import AppShell from './components/AppShell';
import { PAGE_MAP } from './data/ia';

const modules=import.meta.glob('./pages/**/*.jsx',{eager:true});
const ROUTES=Object.values(modules).reduce((all,mod)=>{all[mod.routeId]=mod.default;return all},{});
const readRoute=()=>{const id=location.hash.replace('#/','');return PAGE_MAP[id]?id:'product-discovery'};

export default function App(){
  const [pageId,setPageId]=useState(readRoute);
  useEffect(()=>{const onHash=()=>setPageId(readRoute());addEventListener('hashchange',onHash);return()=>removeEventListener('hashchange',onHash)},[]);
  const navigate=id=>{if(!PAGE_MAP[id])return;location.hash=`/${id}`;window.scrollTo({top:0,behavior:'smooth'})};
  const Page=useMemo(()=>ROUTES[pageId]||ROUTES['product-discovery'],[pageId]);
  return <AppShell pageId={pageId} navigate={navigate}><Page navigate={navigate}/></AppShell>;
}
