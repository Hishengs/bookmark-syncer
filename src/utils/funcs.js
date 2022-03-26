// setTimeout alternative for web service
/* export async function delay (time = 2000) {
  return new Promise((resolve) => {
    const name = Date.now() + '';
    chrome.alarms.create(name, {
      when: Date.now() + time,
    });
    chrome.alarms.onAlarm.addListener((alarm) => {
      if (alarm.name === name) {
        resolve();
      }
    });
  });
} */

export async function delay (time = 2000) {
  return new Promise((resolve) => {
    setTimeout(resolve, time)
  });
}