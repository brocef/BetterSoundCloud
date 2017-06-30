function setStatus(status_msg, type) {
	var status_span = document.getElementById("status_span");
	status_span.classList.remove("bsc_info", "bsc_warning", "bsc_error", "bsc_hidden");
	if (type === "err") {
		status_span.classList.add("bsc_error");
	} else if (type === "info") {
		status_span.classList.add("bsc_info");
	} else if (type === "warning") {
		status_span.classList.add("bsc_warning");
	}
	status_span.innerHTML = status_msg;
	setTimeout(2000, function() {
		status_span.classList.add("bsc_hidden");
	});
}

function save_options() {
	var min_duration = document.getElementById('min_duration').value;
	var max_duration = document.getElementById('max_duration').value;
	
	chrome.storage.sync.set({
		minimumTrackDuration: min_duration,
		maximumTrackDuration: max_duration
	}, function() {
		setStatus("Settings saved successfully", "info");
	});
}

function restore_options() {
  chrome.storage.sync.get({
    minimumTrackDuration: 0,
    maximumTrackDuration: -1
  }, function(items) {
    document.getElementById('min_duration').value = items.minimumTrackDuration;
    document.getElementById('max_duration').value = items.maximumTrackDuration;
  });
}
document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click',
    save_options);