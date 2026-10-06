import React from 'react';

const Loading = () => {
  const containerStyle = {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    backgroundColor: '#ffffff',
    width: '100vw',
    height: '100vh'
  };

  const logoStyle = {
    width: '120px',
    height: '120px',
    animation: 'pulse 1.5s infinite ease-in-out'
  };

  return (
    <div style={containerStyle}>
      <style>
        {`
          @keyframes pulse {
            0% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.1); opacity: 0.7; }
            100% { transform: scale(1); opacity: 1; }
          }
        `}
      </style>
      <img src="img/logo-korat-secare.png" alt="Company Logo" style={logoStyle} />
    </div>
  );
};

export default Loading;
