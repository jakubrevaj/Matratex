function Error({ statusCode }: { statusCode: number }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      <h1 style={{ fontSize: '72px', margin: '0' }}>{statusCode || 'Error'}</h1>
      <p style={{ fontSize: '24px', color: '#666' }}>
        {statusCode === 404 ? 'Stránka nenájdená' : 'Vyskytla sa chyba'}
      </p>
    </div>
  );
}

Error.getInitialProps = ({ res, err }: any) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default Error;
