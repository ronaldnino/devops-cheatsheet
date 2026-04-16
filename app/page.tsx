import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import { useRouter } from 'next/router';

const Page = () => {
    const router = useRouter();

    return (
        <div>
            <header>
                <h1>Welcome to My Page</h1>
                <Image src="isotipo.png" alt="Isotipo" />
            </header>
            <main>
                <h2>About Us</h2>
                <p>This is the about section of the page.</p>
                <Link href="/contact">Contact Us</Link>
            </main>
            <footer>
                <p>&copy; 2026 My Page</p>
                <img src="isotipo.png" alt="Isotipo" />
            </footer>
            <img src="isotipo.png" alt="Isotipo" />
        </div>
    );
};

export default Page;