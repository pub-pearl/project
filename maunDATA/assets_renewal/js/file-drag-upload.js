
 (function(){
	function Init(){
		var fileSelect = document.getElementById('file-upload'),
			fileDrag = document.getElementById('file-drag'),
			submitButton = document.getElementById('submit-button'),
			fileAdd = document.getElementById('fileAdd'),
			fileListNum = document.querySelector('.fileNum'),
			filesVolume = document.querySelector('.fileVolume');

		// 파일 선택 시 
		fileSelect.addEventListener('change', fileSelectHandler, false);
		fileAdd.addEventListener('change', fileSelectHandler, false);

		var xhr = new XMLHttpRequest();
		if (xhr.upload) {
			// 파일 드래그 앤 드롭 시
			fileDrag.addEventListener('dragover', fileDragHover, false);
			fileDrag.addEventListener('dragleave', fileDragHover, false);
			fileDrag.addEventListener('drop', fileSelectHandler, false);
		}
	}

	// 파일 드래그 앤 드롭 시 
	function fileDragHover(e){
		e.stopPropagation();
		e.preventDefault();

		var fileDrag = document.getElementById('file-drag');		
		fileDrag.className = (e.type === 'dragover' ? 'hover' : 'modal-body file-upload');
	}

	// 파일 선택 시
	function fileSelectHandler(e) {
		var fileUploadBox = document.querySelector('.upload_form_box'),
			fileAddButton = document.querySelectorAll('.btn_file_add')[1];
		fileUploadBox.classList.remove('active');
		fileAddButton.style.display = 'inline-block';

		// Fetch FileList object
		var files = e.target.files || e.dataTransfer.files;

		// Cancel event and hover styling
		fileDragHover(e);

		// 파일 업로드 될 시 실행
		for (var i = 0, f; f = files[i]; i++) {
			parseFile(f);
			uploadFile(f);
		}

		// 파일 목록 체크 시 해당 row 활성화 효과
        $('.eachChk').on('click', function(){
            var thisChecked = $(this).prop('checked'); 
        
            if(thisChecked){
                $(this).parents('tr').addClass('checked');
            }else{
                $(this).parents('tr').removeClass('checked');
            }
        });

		// table checkbox 개별 / 전체 선택
		$('.allChk').on('click', function(){
			var thisTableBox = $(this).parents('.icld_chk'),
				allCheck = $(this).prop('checked'); 
			
			if(allCheck){
				thisTableBox.find('.eachChk').prop('checked', true); 
			}else{
				thisTableBox.find('.eachChk').prop('checked', false); 
			}
		});
		
		// 모든 체크박스를 클릭하면 버튼 활성화시키기
		$('.eachChk').on('click', function(e){
			e.stopPropagation();
	
			var thisTableBox = $(this).parents('.icld_chk'),
				eachCheck = $(this).prop('checked'); 
				
			// 자식 체크 전체 체크시, 부모 체크박스 체크 됨
			var checkBoxLength = thisTableBox.find('.eachChk').length,
				checkedLength = thisTableBox.find('.eachChk:checked').length;
				   
			// 체크박스가 모두 선택되었을 때 상위 체크박스 선택되도록 설정
			if(checkBoxLength == checkedLength){
				thisTableBox.find('.allChk').prop('checked', true); 
			}else{
				thisTableBox.find('.allChk').prop('checked', false);
			}       
		});

		// 파일 업로드 후 파일 추가 시 기존의 선택 파일들 모두 reset
		$('.tbl_file_list.fl').find('tr').removeClass('checked');
		$('.tbl_file_list.fl').find('.allChk, .eachChk').prop('checked', false);

		// 대기 파일 목록의 대기 건, 총 용량 계산
		var fileNum = $('#messages').find('tr').length,
			fileVolumeTd = $('#messages').find('td:last-child');

		$('.fileNum').text(fileNum);
		fileVolumeTd.each(function(){
			var fileVolume = 0,
				fileVolumeText = $(this).text();
			fileVolumeText = parseFloat(fileVolumeText);
			fileVolume = fileVolume + fileVolumeText;
		});
		
		// fileVolume = fileVolume.replace('MB', '');
		// fileVolume = parseInt(fileVolume);

		// console.log(fileVolume.length)
	}

	// 파일 목록 생성
	function output(msg){
		var m = document.getElementById('messages');
		m.innerHTML = msg + m.innerHTML;
	}

	// 파일 목록 생성 템플릿
	function parseFile(file){
		output(
			'<tr>'
			+	'<td scope="row">'
			+		'<div class="chkBoxOnly">'
			+			'<input type="checkbox" class="eachChk">'
			+		'</div>'
			+	'</td>'
			+	'<td>' + encodeURI(file.name) +'</td>'
			+	'<td>' + (file.size / (1024 * 1024)).toFixed(2) + 'MB</td>'
			+'</tr>'
		);
	}

	function setProgressMaxValue(e){
		var pBar = document.getElementById('file-progress');

		if(e.lengthComputable){
			pBar.max = e.total;
		}
	}

	function updateFileProgress(e){
		var pBar = document.getElementById('file-progress');

		if(e.lengthComputable){
			pBar.value = e.loaded;
		}
	}

	function uploadFile(file){

		var xhr = new XMLHttpRequest(),
			fileInput = document.getElementById('class-roster-file'),
			pBar = document.getElementById('file-progress'),
			fileSizeLimit = 1024;	// In MB
		if (xhr.upload){
			// Check if file is less than x MB
			if (file.size <= fileSizeLimit * 1024 * 1024){
				// Progress bar
				xhr.upload.addEventListener('loadstart', setProgressMaxValue, false);
				xhr.upload.addEventListener('progress', updateFileProgress, false);

				// File received / failed
				xhr.onreadystatechange = function(e){
					if (xhr.readyState == 4){
						// Everything is good!						
						// progress.className = (xhr.status == 200 ? "success" : "failure");
						// document.location.reload(true);
					}
				};

				// Start upload
				// [D] 하단의 'xhr.send(file);' 부분은 퍼블환경에서 오류가 생겨 주석처리 하였습니다.
				xhr.open('POST', document.getElementById('file-upload-form').action, true);
				xhr.setRequestHeader('X-File-Name', file.name);
				xhr.setRequestHeader('X-File-Size', file.size);
				xhr.setRequestHeader('Content-Type', 'multipart/form-data');
				// xhr.send(file);
			}else{
				output('Please upload a smaller file (< ' + fileSizeLimit + ' MB).');
			}
		}
	}

	// Check for the various File API support.
	if (window.File && window.FileList && window.FileReader){
		Init();
	}else{
		document.getElementById('file-drag').style.display = 'none';
	}

	// 파일 목록 체크 시 해당 row 활성화 효과
	$('.eachChk').on('click', function(){
		var thisChecked = $(this).prop('checked'); 
	
		if(thisChecked){
			$(this).parents('tr').addClass('checked');
		}else{
			$(this).parents('tr').removeClass('checked');
		}
	});
})();
