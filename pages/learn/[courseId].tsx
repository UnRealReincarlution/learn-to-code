import React from "react";
import { useState } from "react"
import nookies from "nookies";

import styles from '../../styles/Home.module.css'
import Head from 'next/head'
import Button from "../../public/components/button"
import { EditorState, convertFromRaw, ContentState } from 'draft-js'
import Editor from 'draft-js-plugins-editor'

import Router from 'next/router'
import dynamic from 'next/dynamic'
const TextEditor = dynamic(import('../../public/components/text_editor'), {
  ssr: false
});

import { firebaseAdmin } from "../../firebaseAdmin"

import { InferGetServerSidePropsType, GetServerSidePropsContext } from "next";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faBookOpen } from "@fortawesome/free-solid-svg-icons";

const styleMap = {
  'CODE': {
    backgroundColor: '#051927',
    fontFamily: 'monospace',
    color: '#f4f4f4',
    padding: '1rem',
    borderRadius: '5px',
    width: '100%',
    display: 'block',
    boxSizing: 'border-box',
    fontSize: '1rem !important'
  },
};

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  try {
    const cookies = nookies.get(ctx);
    const token = await firebaseAdmin.auth().verifyIdToken(cookies.token);
    const { uid, email } = token;
    const user = token;

    // the user is authenticated!
    // FETCH STUFF HERE
    const db = firebaseAdmin.firestore();
    const courseId = ctx.params.courseId; // TEMPVAR
    let pageData;

    await db.doc(`courses/${courseId}`).get().then((doc) => {
      pageData = doc.data()
    })

    const lV = [ 0, 0 ]  // TEMPVAR

    return {
      props: { message: `Your email is ${email} and your UID is ${uid}.`, user: user, pageData: pageData, lessonVariance: lV },
    };
  } catch (err) {
    console.log(err)

    return {
      redirect: {
        permanent: false,
        destination: "/auth",
      },
      props: {} as never,
    };
  }
};

const HomePage = (props: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const user = props.user;

  const [ [lesson, subLesson], setLessonVariance ] = useState(props.lessonVariance);
  const [ lessonCompleted, setLessonCompleted ] = useState(true)

  const [ lessonSelectorVisible, setLessonSelectorVisible ] = useState(false)
  let currentLesson = props.pageData.lessons[lesson].sub_lessons[subLesson];

  const [ content, setContent ] = useState(EditorState.createWithContent(
    convertFromRaw(currentLesson.desc)
  ))

  return (
    <div className={styles.container}>
        <Head>
            <title>Learn to Code</title>
            <link rel="icon" href="/favicon.ico" />
        </Head>

        <div className={`${styles.codeDesc} ${(!lessonSelectorVisible) ? styles.lessonsHidden : styles.lessonSelect}`} > {/* hidden={!lessonSelectorVisible}  style={{ display: (!lessonSelectorVisible)? "none" : "block" }}*/}
          {
            props.pageData.lessons.map(e => {
              return ( 
                <div>
                  <div className={styles.subClasses}>
                    <h2>{props.pageData.title} </h2>

                    <h5>{e.name}</h5>
                    <h3>LESSONS</h3>
                    
                    <div className={styles.lessonList}>
                      {
                        e.sub_lessons.map((e2, index) => {
                          return (
                            <div className={styles.exc} onClick={() => { 
                              setLessonVariance([lesson, index]); 
                              setLessonSelectorVisible(!lessonSelectorVisible);

                              setContent(EditorState.createWithContent(
                                convertFromRaw(props.pageData.lessons[lesson].sub_lessons[index].desc)
                              ))

                              currentLesson = (
                                props.pageData.lessons[lesson].sub_lessons[index]
                              )
                            }}>
                            
                              {`${lesson+1}.${index+1}`} {e2.name}
                            </div>
                          )
                        })
                      }
                    </div>
                  </div>                    
                </div>
              )
            })
          }
        </div>
        <div className={`${(!lessonSelectorVisible) ? styles.normalOut : styles.blackOut}`} onClick={() => setLessonSelectorVisible(!lessonSelectorVisible)}></div>

        <div className={styles.learnInterface}>
          <div className={`${styles.codeGrid}`} >
            <div className={styles.headerCustom}>
              <div className={styles.headerInsideCustom}>
                <h3 className={styles.headerTitle} onClick={() => Router.push("/")}>Learn to Code.</h3> 

                <h4>{props.pageData.title}</h4>

                {(!user) 
                    ? 
                    <a>Login</a>
                    :
                    <div className={styles.linear}>
                      <a onClick={() => Router.push("/account")}>{user.name}</a>
                      {/* <a onClick={() => firebaseClient.auth().signOut()}>Signout</a> */}
                    </div>
                }
              </div>
            </div>

            {
              (currentLesson.type === 'code') ?
                <div className={styles.codeInterface}>
                  <div className={styles.codeDesc}> {/*hidden={lessonSelectorVisible} */}
                    <h4>
                      <FontAwesomeIcon
                        icon={faBookOpen}
                        size="1x"
                        />
                      
                      Learn
                    </h4>

                    <div>
                      <h3>{`${props.pageData.lessons[lesson].name.toUpperCase()} ${"I"}`}</h3>
                      <h2>{currentLesson.name}</h2>
                      {/* <p>{currentLesson.desc}</p> */}

                      
                      <Editor
                      
                        editorState={content} 
                        onChange={() => {}}
                        readOnly={true}
                        customStyleMap={styleMap}
                      />
                      
                    </div>
                  </div>

                  <TextEditor lan='javascript' placeholder={currentLesson.template_code}/>
                  <div className={styles.consolePage}></div>
                </div>
              :
                <div className={styles.widthContent}>
                  <div>
                    <h1>{currentLesson.name}</h1>
                    
                    <Editor
                      editorState={content}
                      onChange={() => {}}
                      readOnly={true}
                      customStyleMap={styleMap}
                    />
                  </div>
                </div>
            }
              <div className={styles.codeFooter}>
                <div className={styles.linearDark} onClick={() => setLessonSelectorVisible(!lessonSelectorVisible)}>
                  <FontAwesomeIcon
                    icon={faBars}
                    size="1x"
                  />
                  <h4>{`${lesson + 1}.${subLesson + 1}`} {currentLesson.name}</h4>
                </div>

                <div className={styles.navigationBottom}>
                  <Button title={"Go Back"} onClick={() => setLessonVariance([lesson, subLesson-1])}></Button>
                  <h3>{subLesson + 1} / {props.pageData.lessons[lesson].sub_lessons.length}</h3>
                  <Button title={"Next Lesson"} onClick={() => setLessonVariance([lesson, subLesson-1])} disabled={(lessonCompleted)}></Button>
                </div>

                <div>
                  {
                    (currentLesson.type === 'code') ?
                    <Button title="Submit" redirect="" router={Router}></Button>
                    :
                    <div></div>
                  }
                  
                </div>
              </div>
          </div> 
        </div>
            
    </div>
  );
}

export default HomePage;