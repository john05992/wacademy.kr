export default {
  async fetch(request, env) {
    try {
      const url = new URL(request.url);
      // KV 테스트
      const kv = await env.GUARD_KV.get('test_key');
      // origin fetch 테스트
      const origin = await fetch(request);
      return new Response('OK status=' + origin.status + ' kv=' + kv, {status:200, headers:{'content-type':'text/plain'}});
    } catch(e) {
      return new Response('CATCH: ' + e.message + '\n' + (e.stack||''), {status:500, headers:{'content-type':'text/plain; charset=utf-8'}});
    }
  }
};
