import React from 'react';
import { getProviders, signIn as signInProv } from 'next-auth/react';

export default function SignIn({ providers }) {
  return (
    <>
      {Object.values(providers).map((provider) => (
        <div key={provider.name}>
          <button onClick={() => signInProv(provider.id, { callbackUrl: '/' })}>
            Sign in with {provider.name}
          </button>
        </div>
      ))}
    </>
  );
}

export async function getServerSideProps() {
  const providers = await getProviders(); // Await the getProviders() function
  return {
    props: {
      providers,
    },
  };
}
