import Head from 'next/head'
import styles from '../styles/Home.module.css'

export default function Home() {
  return (
    <>
      <Head>
        <title>Superstar Broadcast Hub</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <main className={styles.container}>
        <h1>Superstar Broadcast Hub</h1>
        <p>This app serves the main UI at <code>/broadcast-ui.html</code>. Open below:</p>
        <div style={{width: '100%', height: '80vh'}}>
          <iframe src="/broadcast-ui.html" style={{width: '100%', height: '100%', border: 'none', borderRadius: 8}} title="Broadcast UI" />
        </div>
      </main>
    </>
  )
}
