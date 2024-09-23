import React, { useState, useEffect } from 'react';
import './CalenderComponent.css';
import { HOURS } from './CalenderConteiner.js';
import axios from 'axios';

const daysOfWeek = ['(日)', '(月)', '(火)', '(水)', '(木)', '(金)', '(土)'];

function CalenderComponent({ events, setEvents }) {
    const [currentDate, setCurrentDate] = useState(new Date());

    const fetchEvents = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5000/events', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setEvents(response.data);
        } catch (error) {
            console.error('Failed to fetch events', error);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, []);

    // 今週の開始日を取得する関数
    const getStartOfWeek = (date) => {
        const dayOfWeek = date.getDay();
        const startOfWeek = new Date(date);
        startOfWeek.setDate(date.getDate() - dayOfWeek);
        return startOfWeek;
    };

    // 日付のリストを生成
    const generateWeekDates = (startOfWeek) => {
        const dates = [];
        for (let i = 0; i < 7; i++) {
            const date = new Date(startOfWeek);
            date.setDate(startOfWeek.getDate() + i);
            dates.push(date);
        }
        return dates;
    };

    // 表示される週の日曜日を取得
    const startOfWeek = getStartOfWeek(currentDate);
    // その週の7日を作成します
    const weekDates = generateWeekDates(startOfWeek);

    // 次の週に移動
    const handleNextWeek = () => {
        const nextWeek = new Date(currentDate);
        nextWeek.setDate(currentDate.getDate() + 7);
        setCurrentDate(nextWeek);
    };

    // 前の週に移動
    const handlePrevWeek = () => {
        const prevWeek = new Date(currentDate);
        prevWeek.setDate(currentDate.getDate() - 7);
        setCurrentDate(prevWeek);
    };

    // 時間枠に対応するイベントを取得する関数
    const getEventForSlot = (date, hour) => {
        if (!events || events.length === 0) {
            return null;
        }

        return events.find(event => {
            const eventStart = new Date(event.start_time);
            return (
                eventStart.getFullYear() === date.getFullYear() &&
                eventStart.getMonth() === date.getMonth() &&
                eventStart.getDate() === date.getDate() &&
                eventStart.getHours() === hour
            );
        });
    };

    const calculateEventPosition = (start, end) => {
        const startTime = new Date(start);
        const endTime = new Date(end);
        const durationInMinutes = (endTime - startTime) / (1000 * 60);
    
        // 各時間帯を60pxの高さと仮定します
        const height = (durationInMinutes / 60) * 60;
    
        // カレンダーが午前0時（00:00）から始まり、各時間帯が60pxの高さで表示されると仮定します
        const topPosition = (startTime.getHours() * 60) + (startTime.getMinutes());

        const celwidth = window.innerWidth;
    
        return { topPosition, height, celwidth };  // 'topPosition' と 'height' を返す
    };
    
    return (
        <div style={{ width: '100%' }}>
            {/* カレンダー上部の表 */}
            <div className="calendar-header sticky-top bg-light">
                <div className='mt-3'>
                    <button onClick={handlePrevWeek} className="btn btn-secondary">
                        &lt;
                    </button>
                    <button onClick={handleNextWeek} className="btn btn-secondary">
                        &gt;
                    </button>
                </div>
                {weekDates.map((date, index) => (
                    <div key={index} className="calendar-day">
                        {date.toLocaleDateString()} &nbsp; {daysOfWeek[date.getDay()]}
                    </div>
                ))}
            </div>
    
            {/* タイムライン */}
            <div className="calendar-body">
                {HOURS.map((hour, hourIndex) => (
                    <div key={hourIndex} className="calendar-row">
                        {/* 時間ラベル */}
                        <div className="calendar-hour">{hour}</div>
    
                        {/* 各日の時間枠 */}
                        {weekDates.map((date, dayIndex) => {
                            const event = getEventForSlot(date, hourIndex);
    
                            // イベントが存在する場合のみ位置を計算
                            if (event) {
                                // ここで calculateEventPosition を呼び出して 'topPosition' と 'height' を取得
                                const { topPosition, height, celwidth } = calculateEventPosition(event.start_time, event.end_time);
    
                                return (
                                    <div key={dayIndex} className="calendar-slot">
                                        <div className="calendar-event">
                                            <div
                                                className="calendar-event"
                                                style={{
                                                    position: 'absolute',
                                                    top: `${topPosition}px`,  // 'topPosition' を適用
                                                    height: `${height}px`,    // 'height' を適用
                                                    backgroundColor: 'lightblue',  // 必要に応じて色をカスタマイズ
                                                    width: `${celwidth}`  // セル全体の幅を占めるように設定
                                                }}
                                            >
                                                {event.title}
                                            </div>
                                        </div>
                                    </div>
                                );
                            } else {
                                return <div key={dayIndex} className="calendar-slot"></div>;
                            }
                        })}
                    </div>
                ))}
            </div>
        </div>
    );
    
    
};

export default CalenderComponent;
