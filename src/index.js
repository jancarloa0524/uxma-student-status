import { initializeApp } from 'firebase/app'
import { getFirestore, collection, onSnapshot, setDoc, updateDoc, doc, query, where, arrayUnion } from 'firebase/firestore'

const firebaseConfig = {
    apiKey: "AIzaSyBq04h3lYW7lXPQN4rkE-wRdVdIF_V2oA4",
    authDomain: "uxma-student-status-e2291.firebaseapp.com",
    projectId: "uxma-student-status-e2291",
    storageBucket: "uxma-student-status-e2291.appspot.com",
    messagingSenderId: "164429027592",
    appId: "1:164429027592:web:f79eef2d0f9c95516774bd"
  };

// init app
initializeApp(firebaseConfig)

// init services
const db = getFirestore()

// collection reference
const colRef = collection(db, 'students')

// Show students in console
onSnapshot(colRef, (snapshot) => {
    let students = []
    snapshot.docs.forEach((doc) => {
        students.push({ ...doc.data(), id: doc.id})
    })
    console.log(students)
})

// Add a student to the database
const addStudentForm = document.querySelector('.add')
addStudentForm.addEventListener('submit', (e) => {
    e.preventDefault()

    setDoc(doc(db, 'students', addStudentForm.name.value), {
        name: addStudentForm.name.value,
        attendance: [],
        report: ""
    })
        .then(() => {
            addStudentForm.reset()
        })
})

// Add attendance day to a student
const dayForm = document.querySelector('.day')

dayForm.addEventListener('submit', (e) => {
  e.preventDefault()
  
  const docRef = doc(db, 'students', dayForm.student.value)

  updateDoc(docRef, {
      attendance: arrayUnion(dayForm.selectDay.value)
  })
    .then(() => {
        dayForm.student.value = ""
    })
})

