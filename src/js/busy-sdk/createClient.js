const BUSY_URL = 'https://busy.org';

function createClient(target, acceptedOrigin = BUSY_URL) {
  const client = {
    target,
    resolvers: {},
    rejectors: {},
    postMessage: message => {
      if (target) target.postMessage(message, '*');
    },
    call: (id, method, params) => {
      client.postMessage(
        JSON.stringify({
          jsonrpc: '2.0',
          id,
          method,
          params,
        }),
      );

      return new Promise((resolve, reject) => {
        client.resolvers[id] = resolve;
        client.rejectors[id] = reject;
      });
    },
    receive: (id, result, error) => {
      if (error) return client.rejectors[id](error);
      return client.resolvers[id](result);
    },
    receiveMessage: message => {
      const { id, result, error } = JSON.parse(message);

      client.receive(id, result || null, error || null);
    },
  };

  document.addEventListener('message', e => {
    client.receiveMessage(e.data);
  });

  return client;
}

export default createClient;
