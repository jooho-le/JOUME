import { useState } from 'react';
import { GLOBAL_NAV } from '../data/ia';
import visetosBackpack from '../assets/visetos-backpack.png';

export default function AppShell({pageId,navigate,children}){
  const [selector,setSelector]=useState(false);
  return <div className="ia-site">
    <header className="ia-header"><button className="ia-logo" onClick={()=>navigate('product-discovery')}>MCM <small>ARCHIVE</small></button><nav>{GLOBAL_NAV.map(([label,id])=><button className={pageId===id?'on':''} onClick={()=>navigate(id)} key={id}>{label}</button>)}</nav><button className="ia-product-trigger" onClick={()=>setSelector(!selector)} aria-label="현재 제품 변경"><img src={visetosBackpack}/><span>MY PRODUCT<small>STARK BACKPACK</small></span><b>⌄</b></button></header>
    {selector&&<div className="ia-selector"><button className="selected" onClick={()=>setSelector(false)}><img src={visetosBackpack}/><span><b>STARK BACKPACK</b><small>VISETOS ORIGINAL · 선택됨</small></span></button><button onClick={()=>navigate('my-products')}><span className="selector-plus">＋</span><span><b>보유 제품 변경</b><small>MY MCM에서 제품 선택</small></span></button><button onClick={()=>navigate('digital-passport')}><span className="selector-pass">◇</span><span><b>Product Passport</b><small>공식 제품 정보 보기</small></span></button></div>}
    {children}
  </div>
}
