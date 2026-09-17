// DOM 요소 선택
const minutesDisplay = document.getElementById('minutes');
const secondsDisplay = document.getElementById('seconds');
const startBtn = document.getElementById('start-btn');
const resetBtn = document.getElementById('reset-btn');
const modeBtns = document.querySelectorAll('.mode-btn');
const themeBtns = document.querySelectorAll('.theme-btn');

// 타이머 변수 설정
let timerId = null;
let timeLeft = 1500; // 기본값: 25분 (1500초)
let isRunning = false;

// 시간을 MM:SS 형식으로 화면에 업데이트하는 함수
function updateDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    minutesDisplay.textContent = String(minutes).padStart(2, '0');
    secondsDisplay.textContent = String(seconds).padStart(2, '0');
}

// 타이머 시작/일시정지 토글 함수
function toggleTimer() {
    if (isRunning) {
        clearInterval(timerId);
        timerId = null;
        startBtn.textContent = '시작';
        isRunning = false;
    } else {
        startBtn.textContent = '일시정지';
        isRunning = true;
        
        // 혹시 모를 중복 인터벌 방지
        if (timerId !== null) clearInterval(timerId);

        timerId = setInterval(() => {
            if (timeLeft > 0) {
                timeLeft--;
                updateDisplay();
            } else {
                clearInterval(timerId);
                timerId = null;
                isRunning = false;
                startBtn.textContent = '시작';
                alert('✨ 시간이 종료되었습니다! 휴식하거나 다음 작업을 시작하세요.');
            }
        }, 1000);
    }
}

// 타이머 초기화 함수
function resetTimer() {
    clearInterval(timerId);
    timerId = null;
    isRunning = false;
    startBtn.textContent = '시작';
    
    // 현재 활성화된 모드의 데이터 타임(초)을 다시 가져와서 세팅
    const activeBtn = document.querySelector('.mode-btn.active');
    if (activeBtn) {
        timeLeft = parseInt(activeBtn.dataset.time, 10);
    } else {
        timeLeft = 1500;
    }
    updateDisplay();
}

// 모드 변경 함수 (집중 / 짧은 휴식 / 긴 휴식)
function changeMode(e) {
    modeBtns.forEach(btn => btn.classList.remove('active'));
    e.target.classList.add('active');

    clearInterval(timerId);
    timerId = null;
    isRunning = false;
    startBtn.textContent = '시작';
    
    timeLeft = parseInt(e.target.dataset.time, 10);
    updateDisplay();
}

// 테마 변경 함수 (핑크, 라벤더, 피치)
function changeTheme(e) {
    const themeName = e.target.dataset.theme;
    
    // 기존 테마 클래스 제거
    document.body.className = '';
    
    // 기본 pink 테마가 아닐 경우에만 클래스 추가
    if (themeName !== 'pink') {
        document.body.classList.add(`theme-${themeName}`);
    }
}

// 이벤트 리스너 등록 안전하게 처리
if (startBtn) startBtn.addEventListener('click', toggleTimer);
if (resetBtn) resetBtn.addEventListener('click', resetTimer);

modeBtns.forEach(btn => {
    btn.addEventListener('click', changeMode);
});

themeBtns.forEach(btn => {
    btn.addEventListener('click', changeTheme);
});

// 초기 화면 세팅
updateDisplay();