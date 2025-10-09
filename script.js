// script.js
// 实现 createLoadingPage 高阶函数、标题交互、滚动视差与导航交互

(function(){
  /* ----------------- createLoadingPage 高阶函数 -----------------
     返回 { openAnimation, closeAnimation }
     - openAnimation(options): 显示 loading（并可传 minTime 毫秒）
     - closeAnimation(): 请求关闭（会等待 minTime 满足）
  -------------------------------------------------------------- */
  function createLoadingPage(elSelector){
    const el = document.querySelector(elSelector);
    if(!el) throw new Error('loading overlay not found');

    let minTime = 300; // 默认最小动画时间 ms
    let openedAt = 0;
    let visible = false;

    // 为 dots 添加随机间隔 / 抖动
    const dots = el.querySelector('#dots');
    function randomizeDots(){
      // 生成 2-4 个 dot spans，随机 margin-left
      const str = '…'; // 使用一个省略号字符视觉代替
      // 我们用 CSS 动画让它跳动（同时在容器设置不同 dx）
      const dx = (Math.random() * 0.2 + 0.1).toFixed(2) + 'rem';
      dots.style.setProperty('--dx', dx);
      dots.style.animation = 'dot-jump 0.9s ease-in-out infinite';
    }
    randomizeDots();
    setInterval(randomizeDots, 1200); // 周期随机化

    function openAnimation(opts = {}){
      if(opts.minTime !== undefined) minTime = Math.max(100, +opts.minTime);
      visible = true;
      openedAt = performance.now();
      // 初始白色背景，过渡到青蓝
      el.classList.remove('hidden');
      el.classList.add('bg-ready');
      el.style.opacity = '1';
      el.style.pointerEvents = 'auto';
    }
    function closeAnimation(){
      const elapsed = performance.now() - openedAt;
      const remain = Math.max(0, minTime - elapsed);
      return new Promise(resolve=>{
        setTimeout(()=>{
          el.classList.add('hidden');
          el.style.pointerEvents = 'none';
          // 彻底隐藏后移除动画
          setTimeout(()=> {
            el.style.display = 'none';
            visible = false;
            resolve();
          }, 700);
        }, remain);
      });
    }
    // 初始化：默认隐藏但保留在DOM
    el.classList.add('bg-ready');
    return { openAnimation, closeAnimation };
  }

  /* ---------- 初始化 loading ---------- */
  const loader = createLoadingPage('#loading-overlay');
  loader.openAnimation({ minTime: 600 }); // 强制至少 600ms

  // 以 window.load 为“资源已就绪”的信号（静态站点）
  window.addEventListener('load', ()=>{
    // 保证至少 600ms，也给观感缓冲
    loader.closeAnimation().then(()=>{
      // 移除 overlay 以便呈现页面
      document.getElementById('loading-overlay').remove();
      // 页面进入动画
      document.querySelectorAll('.page').forEach(p=>p.classList.add('page-enter'));
      // 绑定滚动交互
      initInteractions();
    });
  });

  /* ---------- 主交互逻辑 ---------- */
  function initInteractions(){
    const mainTitle = document.getElementById('mainTitle');
    const lockArea = document.getElementById('lockArea');
    const guideHint = document.getElementById('guideHint');
    const topbar = document.getElementById('topbar');
    const hamburger = document.getElementById('hamburger');
    const sideMenu = document.getElementById('sideMenu');
    const sideItems = sideMenu.querySelectorAll('li');
    const site = document.getElementById('site');

    // 1) 标题点击 / 触摸 / 滑动 激活变形动画（只触发一次）
    let titleActivated = false;
    function titleAnimateOnce(){
      if(titleActivated) return;
      titleActivated = true;
      // 简单的“内变形释放后回到原位”动画：放大 -> 水波缩回 -> 恢复
      mainTitle.animate([
        { transform: 'scale(1) skewY(0)', filter:'blur(0px)' },
        { transform: 'scale(1.18) skewY(-6deg)', filter:'blur(.8px)' },
        { transform: 'scale(.9) skewY(4deg)', offset:0.7 },
        { transform: 'scale(1) skewY(0)', filter:'blur(0px)' }
      ], { duration: 900, easing: 'cubic-bezier(.2,.9,.2,1)' });
      // 出场效果后显示锁链方块
      setTimeout(()=> lockArea.classList.add('visible'), 900);
    }
    // 页面任意点击 / 触摸 / fling 上滑均触发
    ['click','touchstart'].forEach(ev=>{
      document.addEventListener(ev, titleAnimateOnce, { once: true, passive:true });
    });
    // 手势上滑：简单地监测 touchmove dy < -20 在 hero 区域
    let touchStartY = null;
    document.addEventListener('touchstart', e=>{
      touchStartY = e.touches ? e.touches[0].clientY : null;
    }, { passive:true });
    document.addEventListener('touchmove', e=>{
      if(touchStartY === null) return;
      const cy = e.touches[0].clientY;
      const dy = cy - touchStartY;
      if(dy < -30) titleAnimateOnce();
    }, { passive:true });

    // 2) 滚动检测：显示/隐藏引导栏、标题上移与锁链动作、视差
    let lastScroll = window.scrollY;
    let ticking = false;
    window.addEventListener('scroll', onScroll, { passive:true });
    function onScroll(){
      if(!ticking){
        window.requestAnimationFrame(()=>{
          const y = window.scrollY;
          const delta = y - lastScroll;
          // 引导栏：当向下滚动（页面下移，用户向下看）显示 topbar，引导栏出现在上滑时（即 delta < 0）？
          if(delta > 8){
            // 向下滚动（往页面底部走） -> show topbar (引导栏冒出)
            document.getElementById('topbar').style.transform = 'translateY(0)';
            guideHint.classList.remove('visible');
          } else if (delta < -8){
            // 向上滚动（手势往上） -> 隐藏 topbar / 显示提示（引导）
         