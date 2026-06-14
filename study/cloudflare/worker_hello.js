export default {
  async fetch(request, env) {
    return new Response('WORKER ALIVE - ' + new URL(request.url).pathname, {
      status: 200,
      headers: {'content-type': 'text/plain; charset=utf-8'}
    });
  }
};
