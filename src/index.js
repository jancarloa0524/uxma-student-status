import { initializeApp } from 'firebase/app'
import { getFirestore, collection, onSnapshot, getDocs, getDoc, setDoc, deleteDoc, updateDoc, doc, arrayUnion, arrayRemove } from 'firebase/firestore'
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, setPersistence, inMemoryPersistence, browserSessionPersistence } from 'firebase/auth'

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
const auth = getAuth()

// collection reference
const colRef = collection(db, 'students')

// current logged-in user reference
const user = auth.currentUser;


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
        .catch((err) => {
            addStudentForm.reset()
            if (user == null) {
                alert("Login in order to use the site!")
            } else {
                alert('An error has occured! Try again.')
            }
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
    .catch((err) => {
        dayForm.student.value = ""
        if (user == null) {
            alert("Login in order to use the site!")
        } else {
            alert("Please enter a valid user!")
        }
    })
})

// Write reports:
const reportForm = document.querySelector('.report')
reportForm.addEventListener('submit', (e) => {
    e.preventDefault()
    
    if (reportForm.reportEntry.value != "") {
        const docRef = doc(db, 'students', reportForm.student.value)

        updateDoc(docRef, {
            report: reportForm.reportEntry.value
        })
            .then(() => {
                reportForm.reset()
            })
            .catch((err) => {
                alert("Please enter a valid user!")
                reportForm.student.value = ""
        })
    } else {
        alert("Please write an entry!")
    }
})

// Add to existing report:
const addReportForm = document.querySelector('.addToReport')
addReportForm.addEventListener('submit', (e) => {
    e.preventDefault()

    
    if (addReportForm.reportEntry.value != "") {
        const docRef = doc(db, 'students', addReportForm.student.value)

        var previousData

        getDoc(docRef)
            .then((doc) => {
                previousData = doc.data().report
                console.log(previousData)

                updateDoc(docRef, {
                    report: previousData + " " + addReportForm.reportEntry.value
                })
                .then(() => {
                    addReportForm.reset()
                })
            })
            .catch((err) => {
                alert("Please enter a valid user!")
                addReportForm.student.value = ""
            })
        
    } else {
        alert("Please write an entry!")
    }
})

// Real-Time Table
const unsubRealTable = onSnapshot(colRef, (snapshot) => {
    var table = document.querySelector('.table')
    
    let rows = document.querySelectorAll('.row')
    for (var i = 0; i < rows.length; i++) {
        rows[i].remove()
    }

    let data = document.querySelectorAll('td')
    for (var i = 0; i < data.length; i++) {
        data[i].remove()
    }

    snapshot.docs.forEach((doc) => {
        let row = document.createElement('tr')
        row.classList.add('row')
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

// Reset Weekly Report
const newWeekForm = document.querySelector('.startNewWeek')
newWeekForm.addEventListener('submit', (e) => {
    e.preventDefault()

    let studentList = []
    getDocs(colRef)
        .then((snapshot) => {
            snapshot.docs.forEach((doc) => {
                studentList.push(doc.data().name)
            })

            studentList.forEach((student) => {
                const docRef = doc(db, 'students', student)
                updateDoc(docRef, {
                    attendance: [],
                    report: ""
                })
            })
        })
        .catch((err) => {
            alert("An error has occured! Try again.")
        })
})

// Reset a Specific Student's Attendance
const resetStudentAttendanceForm = document.querySelector('.resetStudentAttendance')
resetStudentAttendanceForm.addEventListener('submit', (e) => {
    e.preventDefault()

    const docRef = doc(db, 'students', resetStudentAttendanceForm.student.value)

    updateDoc(docRef, {
        attendance: []
    })
        .then(() => {
            resetStudentAttendanceForm.reset()
        })
        .catch((err) => {
            alert("Please enter a valid user!")
            resetStudentAttendanceForm.student.value = ""
        })
})

// Remove a specific day from a students attendance
const removeSpecificDayForm = document.querySelector('.removeSpecificDay')
removeSpecificDayForm.addEventListener('submit', (e) => {
    e.preventDefault()

    const docRef = doc(db, 'students', removeSpecificDayForm.student.value)

  updateDoc(docRef, {
      attendance: arrayRemove(removeSpecificDayForm.selectDay.value)
  })
    .then(() => {
        removeSpecificDayForm.student.value = ""
    })
    .catch((err) => {
        alert("Please enter a valid user!")
        removeSpecificDayForm.student.value = ""
    })
})

// Remove a student from the database
const removeStudentForm = document.querySelector('.removeStudent')
removeStudentForm.addEventListener('submit', (e) => {
    e.preventDefault()

    const docRef = doc(db, 'students', removeStudentForm.student.value)
    deleteDoc(docRef)
        .then(() => {
            removeStudentForm.reset()
        })
        .catch((err) => {
            alert("Please enter a valid user!")
        })
})

// Real-Time Reference Table
const unsubRefTable = onSnapshot(colRef, (snapshot) => {
    var table = document.querySelector('.referenceTable')
    
    let rows = document.querySelectorAll('.studentRow')
    for (var i = 0; i < rows.length; i++) {
        rows[i].remove()
    }

    let data = document.querySelectorAll('.student')
    for (var i = 0; i < data.length; i++) {
        data[i].remove()
    }

    snapshot.docs.forEach((doc) => {
        let row = document.createElement('tr')
        row.classList.add('studentRow')
        table.appendChild(row)

        let item = document.createElement('td')
        item.classList.add('student')
        item.innerHTML = doc.data().name
        row.appendChild(item)
    })
})

// Login user
const loginForm = document.querySelector('.login')
loginForm.addEventListener('submit', (e) =>{
  e.preventDefault()

  // get email and password values
  const email = loginForm.email.value
  const password = loginForm.password.value

  // pass in auth, email, and password, then login user, catch error if occured
  setPersistence(auth, inMemoryPersistence, browserSessionPersistence)
    .then(() => {
        return signInWithEmailAndPassword(auth, email, password).then((cred) => {
            console.log('user logged in:', cred.user)
            loginForm.reset()
            modal_container.classList.remove("show"); // Removes modal
        })
        .catch((err) => {
          console.log(err.message)
          loginForm.reset()
        
          document.getElementById('modalParagraph').style.display = "block";
        })
    })
    .catch((err) => {
        console.log(err.message)
    })
  
})

onAuthStateChanged(auth, (user) => {
    console.log('user status changed:', user)
  })