import React, { useState, useContext } from 'react'
import { AuthContext } from '../../context/AuthProvider'
import { Bar } from "react-chartjs-2"
import Chart from 'chart.js/auto'
import Comments from '../Comment/Comments'
import '../../styles/Prophecy.css'
import VotingModal from './VotingModal'

const Prophecy = (props) => {

  const { data } = props
  const { user } = useContext(AuthContext)

  const [OpenVotingModal, setOpenVotingModal] = useState(false)
  const [userParticipated, setUserParticipated] = useState(checkUserParticipated())
  const [userChoice, setUserChoice] = useState(getUserChoice())
  //console.log(data)

  function checkUserParticipated () {
    for (let i = 0; i < data.options.length; i++) {
      if (data.options[i].VoterId.includes(user._id)) {
        return true
      }
    }
    return false
  }

  function getUserChoice () {
    for (let i = 0; i < data.options.length; i++) {
      if (data.options[i].VoterId.includes(user._id)) {
        return data.options[i].option
      }
    }
    return ""
  }

  function modifyCreatedTime (createdTime) {
    const monthName = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
    createdTime = new Date(createdTime)
    const year = createdTime.getFullYear()
    const month = monthName[createdTime.getMonth()]
    const date = createdTime.getDate()
    return month + " " + date + ", " + year
  }

  const votingData = {
    labels: data.options.map((item) => item.option),
    datasets: [
      {
        label: "Users Votes",
        data: data.options.map((item) => item.VoterId.length),
        backgroundColor: [
          //如果很多选项 多加点颜色
          'rgba(255, 99, 132, 0.2)',
          'rgba(255, 159, 64, 0.2)',
          'rgba(255, 205, 86, 0.2)',
          'rgba(75, 192, 192, 0.2)',
          'rgba(54, 162, 235, 0.2)',
          'rgba(153, 102, 255, 0.2)',
          'rgba(201, 203, 207, 0.2)'
        ],
        borderColor: [
          'rgb(255, 99, 132)',
          'rgb(255, 159, 64)',
          'rgb(255, 205, 86)',
          'rgb(75, 192, 192)',
          'rgb(54, 162, 235)',
          'rgb(153, 102, 255)',
          'rgb(201, 203, 207)'
        ],
      },
    ],
  }
  const options = {
    indexAxis: 'y',
    elements: {
      bar: {
        borderWidth: 2,
        hoverBorderWidth: 4,
      },
    },
  }

  function votingProphecy () {
    setOpenVotingModal(true)
  }

  async function submitVote (optionIndex) {
    console.log(optionIndex)
    setOpenVotingModal(false)
    console.log(data.options)
    data.options[optionIndex].VoterId.push(user._id)

    await fetch(`${process.env.REACT_APP_API_URL}/prophecy/addVote/` + data._id, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ options: data.options, numUser: data.numUser + 1 })
    })
      .then(
        console.log('success')
      )
      .catch(
        error => console.log('error', error)
      )

    setUserParticipated(true)
    setUserChoice(data.options[optionIndex].option)

  }
  return (
    <div className='Prophecy'>

      <div className='Prophecy-header'>
        <h2 className='Prophecy-title'>{data.title}</h2>
        <div className='Prophecy-status'>
          {data.result !== -1 && <div style={{ "color": "red" }}>Close</div>}
          {data.result === -1 && <div style={{ "color": "green" }}>Open</div>}
        </div>

      </div>


      <Bar data={votingData} options={options} />
      <div className='Prophecy-detail'>
        <div className='Prophecy-info'>
          <div>Number Vote: {data.numUser}</div>
          <div>{modifyCreatedTime(data.createdTime)}</div>
        </div>
        {userParticipated &&
          <div className='Prophecy-userParticipate'>
            <div>Voted !</div>
            <div>Your Choices: {userChoice}</div>
          </div>}
        {data.result === -1 && (!userParticipated && <button onClick={votingProphecy}>Participate</button>)}
      </div>
      {OpenVotingModal && <VotingModal Prophecy={data} closeModal={setOpenVotingModal} submit={submitVote} />}

      <Comments ProphecyId={data._id} />


    </div >
  )
}

export default Prophecy