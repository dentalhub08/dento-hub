import fs from "node:fs";

const file = "src/app/globals.css";

if (!fs.existsSync(file)) {
  console.error("Missing src/app/globals.css. Run this from inside dento-hub-app.");
  process.exit(1);
}

let css = fs.readFileSync(file, "utf8");

const START = "/* DENTO_ADMIN_TOPBAR_FIX_START */";
const END = "/* DENTO_ADMIN_TOPBAR_FIX_END */";

const block = `
${START}

/* Clean Admin top-right controls */
.admin-top{
  min-height:64px;
  height:64px;
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:24px;
  padding:0 30px;
  background:#fff;
  border-bottom:1px solid #e1e9e9;
  position:sticky;
  top:0;
  z-index:50;
}

.admin-top-actions{
  margin-left:auto;
  display:flex;
  align-items:center;
  justify-content:flex-end;
  gap:10px;
  flex:0 0 auto;
  position:relative;
}

.admin-notification-wrap,
.admin-user-menu-wrap{
  position:relative;
  display:flex;
  align-items:center;
}

.admin-bell-button{
  width:38px;
  height:38px;
  padding:0;
  border:1px solid #dfe8e8;
  background:#f7faf9;
  border-radius:11px;
  color:#173740;
  display:grid;
  place-items:center;
  position:relative;
  cursor:pointer;
  line-height:1;
}

.admin-bell-button:hover{
  background:#eef8f6;
  border-color:#c7e4de;
}

.admin-notification-dot{
  position:absolute;
  right:-4px;
  top:-5px;
  min-width:18px;
  height:18px;
  padding:0 4px;
  border:2px solid #fff;
  border-radius:999px;
  background:#ff7654;
  color:#fff;
  display:grid;
  place-items:center;
  font-size:8px;
  font-weight:900;
  line-height:1;
}

.admin-user-trigger{
  height:40px;
  max-width:260px;
  padding:0 12px 0 6px;
  border:1px solid #dfe8e8;
  background:#fff;
  border-radius:11px;
  display:flex;
  align-items:center;
  gap:8px;
  color:#17333b;
  font-size:11px;
  font-weight:800;
  white-space:nowrap;
  cursor:pointer;
}

.admin-user-trigger:hover{
  background:#f8fbfa;
}

.admin-user-avatar{
  width:29px;
  height:29px;
  flex:0 0 29px;
  border-radius:9px;
  background:#e8f8f4;
  color:#078d80;
  display:grid;
  place-items:center;
  font-size:11px;
  font-weight:900;
}

.admin-user-trigger svg{
  flex:0 0 auto;
  color:#6b8389;
}

.admin-user-dropdown,
.admin-orders-popover{
  position:absolute;
  right:0;
  top:calc(100% + 10px);
  background:#fff;
  border:1px solid #dfe8e7;
  border-radius:15px;
  box-shadow:0 20px 55px rgba(12,42,52,.16);
  z-index:200;
  overflow:hidden;
}

.admin-user-dropdown{
  width:260px;
  padding:8px;
}

.admin-user-dropdown-head{
  padding:10px 10px 12px;
  border-bottom:1px solid #edf1f1;
  margin-bottom:5px;
  display:flex;
  flex-direction:column;
  gap:3px;
}

.admin-user-dropdown-head b{
  font-size:11px;
  line-height:1.2;
}

.admin-user-dropdown-head small{
  display:block;
  max-width:220px;
  overflow:hidden;
  text-overflow:ellipsis;
  white-space:nowrap;
  color:#71878c;
  font-size:9px;
  font-weight:500;
}

.admin-user-dropdown>a,
.admin-user-dropdown>button{
  width:100%;
  min-height:39px;
  padding:0 10px;
  border:0;
  background:transparent;
  border-radius:9px;
  display:flex;
  align-items:center;
  gap:9px;
  color:#36535b;
  font-size:10px;
  font-weight:800;
  text-align:left;
  cursor:pointer;
}

.admin-user-dropdown>a:hover,
.admin-user-dropdown>button:hover{
  background:#f0f8f6;
  color:#087f74;
}

.admin-user-dropdown>button{
  color:#a44c3c;
}

.admin-orders-popover{
  width:min(390px,calc(100vw - 32px));
  max-height:520px;
  display:flex;
  flex-direction:column;
}

.admin-popover-head{
  padding:15px 16px 12px;
  display:flex;
  align-items:flex-start;
  justify-content:space-between;
  gap:15px;
  border-bottom:1px solid #edf2f2;
}

.admin-popover-head>div{
  display:flex;
  flex-direction:column;
  gap:3px;
}

.admin-popover-head b{
  font-size:12px;
}

.admin-popover-head small{
  color:#7a8f94;
  font-size:9px;
}

.admin-popover-head>a{
  color:#078d80;
  font-size:9px;
  font-weight:900;
  white-space:nowrap;
}

.admin-notice-list{
  overflow:auto;
  max-height:390px;
}

.admin-notice-row{
  display:flex;
  gap:11px;
  padding:12px 15px;
  border-bottom:1px solid #edf2f2;
}

.admin-notice-row:hover{
  background:#f8fbfa;
}

.admin-notice-icon{
  width:32px;
  height:32px;
  flex:0 0 32px;
  border-radius:9px;
  background:#edf8f5;
  color:#078d80;
  display:grid;
  place-items:center;
}

.admin-notice-copy{
  min-width:0;
  flex:1;
  display:flex;
  flex-direction:column;
  gap:4px;
}

.admin-notice-copy>div{
  display:flex;
  align-items:center;
  gap:7px;
  flex-wrap:wrap;
}

.admin-notice-copy b{
  font-size:10px;
}

.admin-notice-copy span,
.admin-notice-copy small{
  color:#748b90;
  font-size:8px;
}

.admin-notice-empty{
  min-height:180px;
  display:flex;
  flex-direction:column;
  align-items:center;
  justify-content:center;
  gap:6px;
  color:#70878c;
  text-align:center;
  padding:25px;
}

.admin-notice-empty b{
  color:#17333b;
  font-size:11px;
}

.admin-notice-empty span{
  font-size:9px;
}

.admin-popover-footer{
  min-height:42px;
  padding:0 15px;
  border-top:1px solid #edf2f2;
  display:flex;
  align-items:center;
  justify-content:space-between;
  color:#087f74;
  font-size:9px;
  font-weight:900;
}

@media(max-width:800px){
  .admin-top{
    padding:0 14px;
    gap:10px;
  }

  .admin-top .admin-search{
    min-width:0;
    flex:1;
  }

  .admin-top .admin-search input{
    width:100%;
    min-width:0;
  }

  .admin-user-trigger{
    width:40px;
    padding:0;
    justify-content:center;
  }

  .admin-user-trigger>b,
  .admin-user-trigger>svg{
    display:none;
  }

  .admin-user-avatar{
    width:30px;
    height:30px;
    flex-basis:30px;
  }
}

${END}
`;

const start = css.indexOf(START);
const end = css.indexOf(END);

if (start !== -1 && end !== -1 && end > start) {
  css = css.slice(0, start) + block.trim() + css.slice(end + END.length);
} else {
  css = css.trimEnd() + "\n\n" + block.trim() + "\n";
}

fs.writeFileSync(file, css, "utf8");
console.log("Admin top-right bar CSS restored.");
