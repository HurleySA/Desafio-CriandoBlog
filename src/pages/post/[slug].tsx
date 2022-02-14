import { GetStaticPaths, GetStaticProps } from 'next';
import Prismic from "@prismicio/client";
import { getPrismicClient } from '../../services/prismic';
import Header from "../../components/Header/index"
import { RichText } from 'prismic-reactjs'
import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({post}: PostProps) {
  const totalPalavras = post.data.content.reduce((prevContent, accContent) => {
    console.log(accContent.body.text);
    const total = accContent.body.text.reduce((prev, acc) => {
      return prev + acc.split(" ").length;
    }, 0)
    return prevContent + total;
  },0)

  const tempoLeitura = Math.ceil(totalPalavras/200);
 
  return(
    <>
      <Header/>
      <div className={styles.banner}>
        <img src={post.data.banner.url} className={styles.img} alt="banner" />
      </div>
      <main className={styles.container}>
        <h1 className={styles.title}>{post.data.title}</h1>
        <div className={styles.info}>
          <FiCalendar size={20} color="#BBBBBB"/>
          <p className={styles.infoP}>{post.first_publication_date}</p>
          <FiUser size={20} color="#BBBBBB"/>
          <p className={styles.infoP}>{post.data.author}</p>
          <FiClock size={20} color="#BBBBBB"/>
          <p className={styles.infoP}>{tempoLeitura} min</p>
        </div>

        {post.data.content.map( content => {
          return(
            <div key={content.body.text[0]}>
              <h2 className={styles.contentTitle}>{content.heading}</h2>
              {content.body.text.map(text => <p key={text} className={styles.contentP}>{text}</p>)}
            </div>
          )
          
        })}
      
      </main>
    </>
  )
}

export const getStaticPaths = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query(
    Prismic.predicates.at('document.type', 'publication'),
  {
    pageSize: 5,
  }
);
  const posts = postsResponse.results.map(post => { 
    return {
      params: { slug: post.uid}
    }
    

})

return {
  paths: posts,
  fallback: false,
}


};

export const getStaticProps = async context => {
  const prismic = getPrismicClient();
  const { slug } = context.params;
  const response = await prismic.getByUID('publication', String(slug), {});

  const dataFormatada = format(new Date(response.first_publication_date),'dd MMM yyyy',
  {
    locale: ptBR,
  });

  const contents = response.data.content.map( content => {
    const body = content.body.map(text => text.text);
    
    return {
      heading: content.heading,
      body: {text: body}
    }
  })
  const post = {
    first_publication_date: dataFormatada,
    data: {
      title: response.data.title,
      banner: {
        url: response.data.banner.url,
      },
      author: response.data.author,
      content:contents
      
    }
  }
  return {
    props: {post}
  } 
};

/* interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
} */