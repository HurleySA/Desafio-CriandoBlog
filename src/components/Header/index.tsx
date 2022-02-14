import styles from './header.module.scss';
import Image from 'next/image';
import router from 'next/router';
export default function Header() {
  return(
    <div className={styles.container}>
      <div className={styles.imagem}>
        <Image src="/images/Logo.svg" width="240" height="26"className='avatar' alt='logo' onClick={() => router.push(`/`)}/>
      </div>
    </div> 
  )
}
