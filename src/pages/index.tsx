import { GetStaticProps } from 'next';
import Image from 'next/image';
import { FiCalendar, FiUserX } from "react-icons/fi";

import Prismic from "@prismicio/client";

import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}
interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  posts: Post[],
  postsPagination: PostPagination;
}

export default function Home({posts, postsPagination}: HomeProps) {
 return(
   <div className={styles.container}>
    <div className={styles.imagem}>
      <Image src="/images/Logo.svg" alt='logo' width="240" height="26"className='avatar' />
    </div>
    {posts.map((post => {
      
      return(
        <a key={post.uid} className={styles.post}>
          <h1 className={styles.h1}>{post.data.title}</h1>
          <p className={styles.p}>{post.data.subtitle}</p>
          <div className={styles.info}>
            <div className={styles.info}>
              <FiCalendar size={20} color="#BBBBBB"/>
              <p className={styles.infoP}>{post.first_publication_date}</p>
            </div>
            <div className={styles.info}>
              <FiUserX size={20} color="#BBBBBB"/>
              <p className={styles.infoP}>{post.data.author}</p>
            </div>
          </div>
        </a>
      )
      
    }))}
      {postsPagination.next_page && <p className={styles.button}>Carregar mais posts</p>}
      
   </div> 
 )
}

export const getStaticProps = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query(
    Prismic.predicates.at('document.type', 'publication'),
    {
      pageSize: 1,
    }
  );

  let pagination = {
    next_page: null,
    results: []
  }
  if(postsResponse.next_page){
    const res = await fetch(postsResponse.next_page);
  const json = await res.json()
  const resultsTratados = json.results.map(post => {
    const dataFormatada = format(new Date(post.first_publication_date),'dd MMM yyyy',
    {
      locale: ptBR,
    });
    
    return {
      uid: post.uid,
      first_publication_date: dataFormatada,
      data:{
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      }
      

    }
  })
  pagination = {
    next_page: postsResponse.next_page,
    results: resultsTratados
  }
  }
  const posts = postsResponse.results.map(post => {
    const dataFormatada = format(new Date(post.first_publication_date),'dd MMM yyyy',
    {
      locale: ptBR,
    });
    
    return {
      uid: post.uid,
      first_publication_date: dataFormatada,
      data:{
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      }
      

    }
 
  })
  return{
    props: {
      posts,
      postsPagination: pagination
    }
  }

};
