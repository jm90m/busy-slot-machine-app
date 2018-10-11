const BUSY_URL = 'https://busy.org';

function createClient(target, acceptedOrigins = [BUSY_URL]) {
  const client = {
    target,
    nextId: 1,
    resolvers: {},
    rejectors: {},
    postMessage: message => {
      if (target) target.postMessage(message, '*');
    },
    call: (method, params) => {
      const id = client.nextId++;

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
    // document.getElementById('result-container').innerHTML = `test-${e.source}`;
    const message = JSON.parse(e.data);
    const hasPairCode = message.pairCode === window.BUSY_SDK_PAIR_CODE;

    if (hasPairCode) {
      client.receiveMessage(e.data);
      return;
    }

    if (acceptedOrigins.indexOf(e.origin) === -1) return;

    client.receiveMessage(e.data);
  });

  return client;
}

export default createClient;
