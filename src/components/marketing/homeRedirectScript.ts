// Inline <script> rendered in the root layout <head>: redirects signed-in
// users and installed-app launches away from the homepage ("/") before first
// paint. It lives in the layout (server-rendered once, never re-created on the
// client) because React warns about <script> tags rendered by pages, and
// next/script "beforeInteractive" only runs after the Next runtime loads,
// which would flash the landing page. Kept in a plain module (not "use client")
// so the server component receives the string. Mirrors HomeRedirect.tsx,
// which covers client-side navigations.
//
// Deliberately does NOT redirect a lingering superadmin session straight to
// /super-admin -- "/" is the public marketing URL, and auto-resuming an
// internal admin console from a stale token (no re-auth) on a link anyone
// could open is a bigger surprise than convenience. A superadmin returns via
// their own bookmark/URL to /super-admin instead.
//
// It also runs first on EVERY page, before any app code, so it carries
// browser-storage keys over from the old "sms_next_" prefix to "edunivo_":
// existing users keep their login, chosen child and preferences instead of
// being signed out by the rename.
export const HOME_REDIRECT_SCRIPT = `(function(){try{
[localStorage,sessionStorage].forEach(function(st){for(var i=st.length-1;i>=0;i--){var k=st.key(i);if(k&&k.indexOf('sms_next_')===0){var n='edunivo_'+k.slice(9);if(st.getItem(n)===null)st.setItem(n,st.getItem(k));st.removeItem(k);}}});
}catch(e){}try{
if(location.pathname!=="/")return;
var s=window.matchMedia('(display-mode: standalone)').matches||window.navigator.standalone===true;
var t=localStorage.getItem('edunivo_user')?'/dashboard':s?'/login':null;
if(t){document.documentElement.style.visibility='hidden';location.replace(t);}
}catch(e){}})();`;
