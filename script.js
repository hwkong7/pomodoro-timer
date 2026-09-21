// DOM 요소 선택
const minutesDisplay = document.getElementById('minutes');
const secondsDisplay = document.getElementById('seconds');
const startBtn = document.getElementById('start-btn');
const resetBtn = document.getElementById('reset-btn');
const modeBtns = document.querySelectorAll('.mode-btn');
const themeBtns = document.querySelectorAll('.theme-btn');
const cycleCountDisplay = document.getElementById('cycle-count');
const customMinutesInput = document.getElementById('custom-minutes');
const customSetBtn = document.getElementById('custom-set-btn');
const notifyToggle = document.getElementById('notify-toggle');
const settingsBtn = document.getElementById('settings-btn');
const settingsOverlay = document.getElementById('settings-overlay');
const settingsCloseBtn = document.getElementById('settings-close-btn');

// 타이머 변수 설정
let timerId = null;
let timeLeft = 1500; // 기본값: 25분 (1500초)
let isRunning = false;
let focusCount = 0; // 완료한 집중 세션 수
let notificationsEnabled = false; // 알림 토글 상태
const DEFAULT_TITLE = document.title;

const MODE_LABELS = {
    focus: '집중',
    short: '짧은 휴식',
    long: '긴 휴식',
};

// 시간을 MM:SS 형식으로 화면에 업데이트하는 함수
function updateDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const mm = String(minutes).padStart(2, '0');
    const ss = String(seconds).padStart(2, '0');

    minutesDisplay.textContent = mm;
    secondsDisplay.textContent = ss;

    if (isRunning) {
        const activeBtn = document.querySelector('.mode-btn.active');
        const label = activeBtn ? MODE_LABELS[activeBtn.dataset.mode] : '';
        document.title = `${mm}:${ss} - ${label}`;
    } else {
        document.title = DEFAULT_TITLE;
    }
}

// 데스크톱 알림 또는 대체 알림 표시
function notifyDone(message) {
    if (notificationsEnabled && 'Notification' in window && Notification.permission === 'granted') {
        new Notification('🍅 뽀모도로 타이머', { body: message });
    } else {
        alert(message);
    }
}

// 특정 모드로 전환하는 함수 (버튼 활성화 상태 + 남은 시간 반영)
function switchToMode(modeName) {
    let targetBtn = null;
    modeBtns.forEach(btn => {
        const isTarget = btn.dataset.mode === modeName;
        btn.classList.toggle('active', isTarget);
        if (isTarget) targetBtn = btn;
    });

    clearInterval(timerId);
    timerId = null;
    setRunningState(false);

    timeLeft = targetBtn ? parseInt(targetBtn.dataset.time, 10) : 1500;
    updateDisplay();
}

// 시작 버튼의 텍스트 + 상태별 색상(class)을 함께 갱신
function setRunningState(running) {
    isRunning = running;
    startBtn.textContent = running ? '일시정지' : '시작';
    startBtn.classList.toggle('running', running);
}

// 타이머 시작/일시정지 토글 함수
function toggleTimer() {
    if (isRunning) {
        clearInterval(timerId);
        timerId = null;
        setRunningState(false);
        updateDisplay();
    } else {
        setRunningState(true);

        // 혹시 모를 중복 인터벌 방지
        if (timerId !== null) clearInterval(timerId);

        timerId = setInterval(() => {
            if (timeLeft > 0) {
                timeLeft--;
                updateDisplay();
            } else {
                clearInterval(timerId);
                timerId = null;
                setRunningState(false);
                updateDisplay();
                handleSessionComplete();
            }
        }, 1000);

        updateDisplay();
    }
}

// 한 세션이 끝났을 때: 알림 + 다음 모드로 자동 전환
function handleSessionComplete() {
    const finishedBtn = document.querySelector('.mode-btn.active');
    const finishedMode = finishedBtn ? finishedBtn.dataset.mode : 'focus';

    if (finishedMode === 'focus') {
        focusCount++;
        cycleCountDisplay.textContent = String(focusCount);

        const isLongBreakTime = focusCount % 4 === 0;
        notifyDone(isLongBreakTime
            ? '✨ 집중 완료! 긴 휴식을 시작해보세요.'
            : '✨ 집중 완료! 짧은 휴식을 시작해보세요.');
        switchToMode(isLongBreakTime ? 'long' : 'short');
    } else {
        notifyDone('휴식이 끝났어요! 다시 집중할 시간입니다.');
        switchToMode('focus');
    }
}

// 타이머 초기화 함수
function resetTimer() {
    clearInterval(timerId);
    timerId = null;
    setRunningState(false);

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
    switchToMode(e.target.dataset.mode);
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

// 커스텀 시간 적용 함수
function applyCustomTime() {
    const minutes = parseInt(customMinutesInput.value, 10);
    if (!minutes || minutes <= 0) return;

    clearInterval(timerId);
    timerId = null;
    setRunningState(false);

    const activeBtn = document.querySelector('.mode-btn.active');
    const seconds = minutes * 60;
    if (activeBtn) {
        activeBtn.dataset.time = String(seconds);
    }
    timeLeft = seconds;
    updateDisplay();

    customMinutesInput.value = '';
}

// 알림 토글 스위치 처리
function setupNotificationToggle() {
    if (!notifyToggle) return;

    if (!('Notification' in window)) {
        notifyToggle.disabled = true;
        return;
    }

    // 이미 브라우저 권한이 허용된 상태면 토글을 켜둔 채로 시작
    notificationsEnabled = Notification.permission === 'granted';
    notifyToggle.checked = notificationsEnabled;

    notifyToggle.addEventListener('change', () => {
        if (notifyToggle.checked) {
            if (Notification.permission === 'granted') {
                notificationsEnabled = true;
            } else if (Notification.permission === 'denied') {
                notifyToggle.checked = false;
                alert('브라우저 설정에서 알림 권한이 차단되어 있어요. 브라우저의 사이트 설정에서 알림을 허용해주세요.');
            } else {
                Notification.requestPermission().then((permission) => {
                    notificationsEnabled = permission === 'granted';
                    notifyToggle.checked = notificationsEnabled;
                });
            }
        } else {
            notificationsEnabled = false;
        }
    });
}

// 설정 팝업 열기/닫기
function openSettings() {
    settingsOverlay.hidden = false;
    settingsBtn.setAttribute('aria-expanded', 'true');
}

function closeSettings() {
    settingsOverlay.hidden = true;
    settingsBtn.setAttribute('aria-expanded', 'false');
}

// 이벤트 리스너 등록 안전하게 처리
if (startBtn) startBtn.addEventListener('click', toggleTimer);
if (resetBtn) resetBtn.addEventListener('click', resetTimer);
if (customSetBtn) customSetBtn.addEventListener('click', applyCustomTime);

if (settingsBtn) settingsBtn.addEventListener('click', openSettings);
if (settingsCloseBtn) settingsCloseBtn.addEventListener('click', closeSettings);

// 팝업 바깥(배경) 클릭 시 닫기
if (settingsOverlay) {
    settingsOverlay.addEventListener('click', (e) => {
        if (e.target === settingsOverlay) closeSettings();
    });
}

modeBtns.forEach(btn => {
    btn.addEventListener('click', changeMode);
});

themeBtns.forEach(btn => {
    btn.addEventListener('click', changeTheme);
});

setupNotificationToggle();

// PWA 서비스워커 등록
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js').catch(() => {
            // 서비스워커 등록 실패는 앱 사용에 치명적이지 않으므로 조용히 무시
        });
    });
}

// 초기 화면 세팅
updateDisplay();
