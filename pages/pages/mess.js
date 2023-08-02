import { useSession } from 'next-auth/react';
import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, where, query } from 'firebase/firestore';
import { db } from '@/firebase';
import Link from 'next/link';

export default function Messenger() {
  
  return (
    <div>
      {session ? (
        <div className="">
        
         
        </div>
      ) : (
        <div>
          <Link href="/auth/signIn">gooo</Link>
        </div>
      )}
    </div>
  );
}
