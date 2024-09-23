import React, { useState } from 'react';
import CalenderInput from './CalenderInput';
import CalenderComponent from './CalenderComponent';
import 'bootstrap/dist/css/bootstrap.min.css';

function CalendarPage() {
    const [events, setEvents] = useState([]);

    const addEvents = (newEvents) => {
        setEvents([...events, newEvents]);
    };

    return (
        <div className="d-flex">
            <div className='new-task-space' style={{ height: '87vh' }}>
                <div className='new-task-form'>
                    <h4 className='mt-3' style={{ textAlign: 'center' }}>Input Event</h4>
                    <CalenderInput addEvents={addEvents} />
                </div>
            </div>
            <div className="all-tasks" style={{ width: '80%' }}>
                <CalenderComponent events={events} setEvents={setEvents} />
            </div>
        </div>
    );
}

export default CalendarPage;
