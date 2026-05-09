import React from 'react';

// Metro resolve para a URL com hash no build web
const bgSrc: string = require('../assets/images/splash-bg.jpg');

export default function Root({ children }: { children: React.ReactNode }) {
  const css = `
    html,body{height:100%;margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif}
    #splash{
      position:fixed;inset:0;z-index:9999;
      background:#F7F5F2 url('${bgSrc}') center/cover no-repeat;
      display:flex;flex-direction:column;justify-content:space-between;
      padding:72px 28px 44px;
    }
    #splash::before{
      content:'';position:absolute;inset:0;pointer-events:none;
      background:linear-gradient(to bottom,rgba(246,241,232,0) 0%,rgba(246,241,232,.88) 100%);
    }
    .s-top,.s-mid,.s-card{position:relative;z-index:1}
    .s-brand{display:block;font-size:15px;letter-spacing:5px;font-weight:600;color:#C8A46B}
    .s-tag{display:block;font-size:11px;letter-spacing:3px;color:#6E675F;margin-top:6px}
    .s-line{width:36px;height:2.5px;background:#C84C4C;margin-top:10px}
    .s-headline{font-size:44px;font-weight:300;color:#2D261F;line-height:52px;margin:0 0 16px}
    .s-sub{font-size:15px;color:#6E675F;line-height:24px;margin:0}
    .s-btn{
      display:flex;align-items:center;justify-content:space-between;
      width:100%;height:58px;background:#8A9776;color:#fff;
      border:none;border-radius:18px;padding:0 24px;margin-top:32px;
      font-size:17px;font-weight:600;cursor:pointer;
    }
    .s-btn:active{opacity:.85}
    .s-link{
      display:block;text-align:center;margin-top:20px;
      font-size:15px;color:#6E675F;text-decoration:underline;cursor:pointer;
      background:none;border:none;
    }
    .s-card{
      background:rgba(255,255,255,.50);border-radius:24px;padding:20px;
      display:flex;align-items:center;gap:12px;
    }
    .s-icon{font-size:20px;flex-shrink:0}
    .s-card-text{flex:1;font-size:14px;color:#2D261F;line-height:22px;margin:0}
  `;

  const splashHtml = `
    <div class="s-top">
      <span class="s-brand">KAIROS</span>
      <span class="s-tag">FAVOR SEM MERECIMENTO</span>
      <div class="s-line"></div>
    </div>
    <div class="s-mid">
      <h1 class="s-headline">Sua direção<br>diária com Deus.</h1>
      <p class="s-sub">Reflexões profundas, presença,<br>silêncio e clareza espiritual<br>para sua caminhada.</p>
      <button class="s-btn" onclick="window.location.href='/onboarding'">
        <span>Começar jornada</span>
        <span>&#x2192;</span>
      </button>
      <button class="s-link" onclick="window.location.href='/home'">Já tenho uma conta</button>
    </div>
    <div class="s-card">
      <span class="s-icon">&#x1F33F;</span>
      <p class="s-card-text">Antes do caos, encontre presença.<br>Antes da pressa, encontre direção.</p>
    </div>
  `;

  // Oculta o splash quando #root tiver filhos com opacity > 0
  const script = `(function(){
    var s=document.getElementById('splash');
    var r=document.getElementById('root');
    if(!s||!r)return;
    if(window.location.pathname!=='/'&&window.location.pathname!==''){s.style.display='none';return}
    function hide(){s.style.transition='opacity 300ms';s.style.opacity='0';setTimeout(function(){s.remove()},310)}
    function check(){
      var c=r.firstElementChild;
      if(!c)return false;
      var op=parseFloat(window.getComputedStyle(c).opacity);
      if(isNaN(op)||op>0){hide();return true}
      return false;
    }
    var obs=new MutationObserver(function(){if(check())obs.disconnect()});
    obs.observe(r,{childList:true,subtree:true,attributes:true,attributeFilter:['style']});
  })();`;

  return (
    <html lang="pt-BR">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <style dangerouslySetInnerHTML={{ __html: css }} />
      </head>
      <body>
        <div id="splash" dangerouslySetInnerHTML={{ __html: splashHtml }} />
        {children}
        <script dangerouslySetInnerHTML={{ __html: script }} />
      </body>
    </html>
  );
}
