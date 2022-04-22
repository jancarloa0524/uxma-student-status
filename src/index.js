import { initializeApp } from 'firebase/app'
import { getFirestore, collection, onSnapshot, setDoc, updateDoc, doc, arrayUnion, getDocs } from 'firebase/firestore'

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
        students.push({ ...doc.data(), id: doc.id })
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

// Write reports:
const reportForm = document.querySelector('.report')
reportForm.addEventListener('submit', (e) => {
    e.preventDefault()

    const docRef = doc(db, 'students', reportForm.student.value)

    updateDoc(docRef, {
        report: reportForm.reportEntry.value
    })
      .then(() => {
          reportForm.reset()
      })
})

// Real-Time Table
onSnapshot(colRef, (snapshot) => {
    var table = document.querySelector('.table')

    snapshot.docs.forEach((doc) => {
        let row = document.createElement('tr')
        table.appendChild(row)
        if(doc.data().attendance != "") {
            for (var j = 0; j <= 2; j++) {
                let item = document.createElement('td')
                if (j == 0){
                    item.innerHTML = doc.data().name
                } else if (j == 1) {
                    item.innerHTML = doc.data().attendance.join(', ')
                } else if (j == 2) {
                    item.innerHTML = doc.data().report
                }
                row.appendChild(item)
            }
        }
    })
})

// Plan for making/seeing student report
/*
First, users msut be able to write reports
    In order to do this, I will allow users to be able to cycle through the users that they haven't written about yet
Second, users must be able to see all data
Use code found here https://jsbin.com/toquhopipa/edit?html,css,js,console,output as basis for creating the table
*/