/* global ace, $, PDFObject, pdf, doc */
/**
 * jsPDFEditor
 * @return {[type]} [description]
 */
var jsPDFEditor = function () {

	var editor, demos = {
		'images.js': 'Images',
		'font-faces.js': 'Font faces, text alignment and rotation',
		'two-page.js': 'Two page Hello World',
		'circles.js': 'Circles',
		'cell.js': 'Cell',
		'font-size.js': 'Font sizes',
		'landscape.js': 'Landscape',
		'lines.js': 'Lines',
		'rectangles.js': 'Rectangles',
		'string-splitting.js': 'String Splitting',
		'text-colors.js': 'Text colors',
		'triangles.js': 'Triangles',
		'user-input.js': 'User input',
		'acroforms.js': 'AcroForms',
		'autoprint.js': 'Auto print',
		'arabic.js': 'Arabic',
		'russian.js': 'Russian',
		'japanese.js': 'Japanese'
	};

	var aceEditor = function () {
		editor = ace.edit("editor");
		editor.setTheme("ace/theme/github");
		editor.setOptions({
			fontFamily: "monospace",
			fontSize: "12px"
		});
		editor.getSession().setMode("ace/mode/javascript");
		editor.getSession().setUseWorker(false); // prevent "SecurityError: DOM Exception 18"

		var timeout;
		editor.getSession().on('change', function () {
			// Hacky workaround to disable auto refresh on user input
			if ($('#auto-refresh').is(':checked') && $('#template').val() != 'user-input.js') {
				if (timeout) clearTimeout(timeout);
				timeout = setTimeout(function () {
					jsPDFEditor.update();
				}, 200);
			}
		});
	};

	var populateDropdown = function () {
		var options = '';
		for (var demo in demos) {
			options += '<option value="' + demo + '">' + demos[demo] + '</option>';
		}
		$('#template').html(options).on('change', loadSelectedFile);
	};

	var loadSelectedFile = function () {
		if ($('#template').val() == 'user-input.js') {
			$('.controls .checkbox').hide();
			$('.controls .alert').show();
			jsPDFEditor.update(true);
		} else {
			$('.controls .checkbox').show();
			$('.controls .alert').hide();
		}

		$.get('examples/js/' + $('#template').val(), function (response) {
			editor.setValue(response);
			editor.gotoLine(0);

			// If autorefresh isn't on, then force it when we change examples
			if (!$('#auto-refresh').is(':checked')) {
				jsPDFEditor.update();
			}

		}, 'text').fail(function () {

			$('.template-picker').html('<p class="source">More examples in <b>examples/js/</b>. We can\'t load them in automatically because of local filesystem security precautions.</p>');

			// Fallback source code
			var source = "";

			source += "\n";
			source +="var truong='THCS Nguyễn Trãi';\nvar hieutruong='Nguyễn Minh Quốc';\nvar namhoc='2019';\nvar huyen='Bình Thuận';\nvar khoangay='25-05-2019';\nvar ban='Cơ bản';\nvar ubnd='UBND THÀNH PHỐ PHAN THIẾT';\nvar ngay='25';\nvar thang='05';\nvar cngang_htk=440;\nvar cngang_truong=50;\nvar cngang_bth=400;\nvar cngang_nv2=250;\nvar quyetdinh='Căn cứ quyết định số 11/2006/ QĐ-BGD&ĐT ngày 05/04/2006 của Bộ Giáo dục và Đào tạo';\n";
			// source += "var doc = new jsPDF({unit: \"pt\",orientation: \"p\",lineHeight: 1.2});\n";
			// source += "\n";

			// source += "doc.addFont(\"Arimo-Regular.ttf\", \"Arimo\", \"normal\");\n//doc.addFont(\"Arimo-Bold.ttf\", \"Arimo\", \"bold\");\ndoc.setFont(\"Arimo\");\ndoc.setFontType(\"normal\");\ndoc.setFontSize(28);\n";
			// source += "doc.text(\"rồi\", 40, 30, 4);\n";
			// source += "doc.addPage('a5','l');\n";
			// source += "var gg=job[Object.keys(job)[0]];\n";
			// source += "for(var i=0;i<gg.length;i++){\nvar item=gg[i];\nvar hoten=item[Object.keys(item)[1]];\ndoc.text(hoten, 40, 30, 0);\ndoc.addPage('a5','l');\n};\n";
			editor.setValue(source);
			editor.gotoLine(0);
		});
	};

	var initAutoRefresh = function () {
		$('#auto-refresh').on('change', function () {
			if ($('#auto-refresh').is(':checked')) {
				$('.run-code').hide();
				jsPDFEditor.update();
			} else {
				$('.run-code').show();
			}
		});

		$('.run-code').click(function () {
			jsPDFEditor.update();
			return false;
		});
	};

	var initDownloadPDF = function () {
		$('.download-pdf').click(function () {
			eval('try{' + editor.getValue() + '} catch(e) { console.error(e.message,e.stack,e); }');

			var file = demos[$('#template').val()];
			if (file === undefined) {
				file = 'demo';
			}
			if (typeof doc !== 'undefined') {
				doc.save(file + '.pdf');
			} else if (typeof pdf !== 'undefined') {
				setTimeout(function () {
					pdf.save(file + '.pdf');
				}, 2000);
			} else {
				alert('Error 0xE001BADF');
			}
		});
		return false;
	};

	return {
		/**
		 * Start the editor demo
		 * @return {void}
		 */
		init: function () {

			// Init the ACE editor
			aceEditor();

			populateDropdown();
			loadSelectedFile();
			// Do the first update on init
			jsPDFEditor.update();

			initAutoRefresh();

			initDownloadPDF();
		},
		/**
		 * Update the iframe with current PDF.
		 *
		 * @param  {boolean} skipEval If true, will skip evaluation of the code
		 * @return
		 */
		update: function (skipEval) {
			setTimeout(function () {

				if (!skipEval) {
					eval('try{' + editor.getValue() + '} catch(e) { console.error(e.message,e.stack,e); }');
					var doc = new jsPDF({unit: "pt",orientation: "p",lineHeight: 0,format:"a4"});
					//var doc = new jsPDF('p', 'pt', 'a4', true);
					//doc.addFont("Arimo-Regular.ttf", "Arimo", "normal");
					//doc.addFont("times.ttf", "Times", "normal");
					//doc.addFont("timesi.ttf", "Times", "italic");
					//doc.addFont("Arimo-Bold.ttf", "Arimo", "bold");
					//doc.setFont("Times");
					//doc.setFontType("normal");
					//doc.setFontSize(sizeFont);
					//doc.text("rồi", cngang, cdoc, 0);
					//doc.addPage('a5','l');

					doc.addFont("Arimo-Regular.ttf", "Arimo", "normal");
					doc.addFont("times.ttf", "Times", "normal");
					doc.addFont("timesi.ttf", "Times", "italic");
					doc.addFont("timesbd.ttf", "Times", "bold");
					//doc.addFont("Arimo-Bold.ttf", "Arimo", "bold");
					doc.setFont("Times");
					doc.setFontType("normal");
					doc.setFontSize(10);

					var gg=job[Object.keys(job)[0]];
					for(var i=0;i<gg.length;i++){
						var item=gg[i];

						var hoten=item["Họ và tên"];
						var ngaysinh=item["Ngày sinh"];
						var gioitinh=item["Giới tính"];
						var dantoc=item["Dân tộc"];
						var noisinh=item["Nơi sinh"];
						var toan=item["Toán học"];
						var li=item["Vật lí"];
						var hoa=item["Hóa học"];
						var sinh=item["Sinh học"];
						var tin=item["Tin học"];
						var van=item["Ngữ văn"];
						var su=item["Lịch sử"];
						var dia=item["Địa lí"];
						var anh=item["Ngoại ngữ"];
						var gdcd=item["GDCD"];
						var cn=item["Công nghệ"];
						var td=item["Thể dục"];
						var nhac=item["Âm nhạc"];
						var mt=item["Mĩ thuật"];
						var tb=item["TB năm"];
						var hk=item["Hạnh kiểm"];
						var hl=item["Học lực"];
						var ut=item["Ưu tiên"];
						var kk=item["KK"];
						var xl=item["XL TN"];
						var gc=item["Ghi chú"];
						var nv1=item["NV1"];
						var nv2=item["NV2"];
						var sovb=item["SỐ VB"];
						var lop=item["Lớp"];

						var cong=0;

						var cngang_ubnd=50;
						var cdoc_ubnd=30+cong;

						var cngang_chxh=300;
						var cdoc_chxh=30+cong;

						var cngang_dltd=325;
						var cdoc_dltd=40+cong;

						//var cngang_truong=50;
						var cdoc_truong=40+cong;

						var cngang_vb=30;
						var cdoc_vb=90+cong;

						var cngang_cntn=150;
						var cdoc_cntn=90+cong;

						var cngang_cc=110;
						var cdoc_cc=110+cong;

						var cngang_ht=110;
						var cdoc_ht=125+cong;

						var cngang_cn=110;
						var cdoc_cn=140+cong;

						var cngang_gt=300;
						var cdoc_gt=140+cong;

						var cngang_dt=400;
						var cdoc_dt=140+cong;

						var cngang_ngs=110;
						var cdoc_ngs=155+cong;

						var cngang_ns=300;
						var cdoc_ns=155+cong;

						var cngang_lop=110;
						var cdoc_lop=170+cong;

						var cngang_nh=300;
						var cdoc_nh=170+cong;

						var cngang_dcn=110;
						var cdoc_dcn=185+cong;

						var cngang_ldc=70;
						var cdoc_ldc=275+cong;

						var cngang_dtt=70;
						var cdoc_dtt=290+cong;

						var cngang_nv1=70;
						var cdoc_nv1=305+cong;

						//var cngang_nv2=250;
						var cdoc_nv2=305+cong;

						//var cngang_bth=400;
						var cdoc_bth=330+cong;

						var cngang_htt=450;
						var cdoc_htt=345+cong;

						var cngang_htk=440;
						var cdoc_htk=400+cong;

						var cngang_ly=30;
						var cdoc_ly=380+cong;

						var cngang_ncc=30;
						var cdoc_ncc=395+cong;

						var cngang_gnc=30;
						var cdoc_gnc=405+cong;



						doc.setFont("Times");
						doc.setFontType("bold");
						doc.setFontSize(10);
						doc.text(ubnd, cngang_ubnd, cdoc_ubnd, 0);
						doc.text("Cộng Hòa Xã Hội Chủ Nghĩa Việt Nam", cngang_chxh, cdoc_chxh, 0);
						doc.text("Độc lập - Tự do - Hạnh phúc", cngang_dltd, cdoc_dltd, 0);
						doc.setFillColor(0,0,0);
						doc.rect(325, 42+cong, 122, 0.5, 'F');
						doc.text("Trường "+truong, cngang_truong, cdoc_truong, 0);
						doc.setFont("Times");
						doc.setFontType("bold");
						doc.setFontSize(12);
						doc.text("GIẤY CHỨNG NHẬN TỐT NGHIỆP TRUNG HỌC CƠ SỞ (Tạm thời)", cngang_cntn, cdoc_cntn, 0);
						doc.setFont("Times");
						doc.setFontType("normal");
						doc.setFontSize(10);
						doc.text("Số VB: "+sovb, cngang_vb, cdoc_vb, 0);
						doc.text(quyetdinh, cngang_cc, cdoc_cc, 0);
						doc.text("Hiệu trưởng trường: "+truong, cngang_ht, cdoc_ht, 0);
						doc.text("Chứng nhận: "+hoten, cngang_cn, cdoc_cn, 0);
						doc.text("Giới tính: "+gioitinh, cngang_gt, cdoc_gt, 0);
						doc.text("Dân tộc: "+dantoc, cngang_dt, cdoc_dt, 0);
						doc.text("Ngày sinh: "+ngaysinh, cngang_ngs, cdoc_ngs, 0);
						doc.text("Nơi sinh: "+noisinh, cngang_ns, cdoc_ns, 0);
						doc.text("Học sinh lớp: "+lop, cngang_lop, cdoc_lop, 0);
						doc.text("Năm học: "+namhoc, cngang_nh, cdoc_nh, 0);
						doc.text("Được công nhận tốt nghiệp Trung học cơ sở khóa ngày: "+khoangay, cngang_dcn, cdoc_dcn, 0);
						doc.setFont("Times");
						doc.setFontType("normal");
						doc.setFontSize(10);
						doc.text("Lý do có điểm ưu tiên, khuyến khích: "+gc, cngang_ldc, cdoc_ldc, 0);
						doc.text("Dự thi tuyển sinh lớp 10 trường THPT ban: "+ban, cngang_dtt, cdoc_dtt, 0);
						doc.text("Nguyện vọng 1: "+nv1, cngang_nv1, cdoc_nv1, 0);
						doc.text("Nguyện vọng 2: "+nv2, cngang_nv2, cdoc_nv2, 0);
						doc.setFont("Times");
						doc.setFontType("italic");
						doc.setFontSize(10);
						doc.text(huyen+", ngày "+ngay+" tháng "+thang+" năm 2019", cngang_bth, cdoc_bth, 0);
						doc.setFont("Times");
						doc.setFontType("bold");
						doc.setFontSize(10);
						doc.text("Hiệu trưởng", cngang_htt, cdoc_htt, 0);
						doc.text(hieutruong, cngang_htk, cdoc_htk, 0);
						doc.text("Lưu ý:", cngang_ly, cdoc_ly, 0);
						doc.setFont("Times");
						doc.setFontType("italic");
						doc.setFontSize(7);
						doc.text("- Nếu có chi tiết sai, phải báo ngay cho trường THCS biết để điều chỉnh", cngang_ncc, cdoc_ncc, 0);
						doc.text("- giấy này có giá trị trong vòng 12 tháng kể từ ngày ký", cngang_gnc, cdoc_gnc, 0);

						var k=13;

						doc.autoTable({head:[['Kết quả các môn học lớp 9','TB Năm','Học lực','Hạnh kiểm','Điểm UT','Điểm KK','Xếp loại TN'],['Toán','Lí','Hóa','Sinh','Văn','Sử','Địa','NN','GDCD','C.nghệ','TD','Nhạc','M.thuật']],body:[[toan,li,hoa,sinh,van,su,dia,anh,gdcd,cn,td,nhac,mt,tb,hl,hk,ut,kk,xl]],
							theme: 'plain',
							startY: 200,
							styles: { // Defaul style
								lineWidth: 0.01,
								lineColor: 0,
								fillStyle: 'DF',
								halign: 'center',
								valign: 'middle',
								columnWidth: '15',
								overflow: 'linebreak',
								font: "Times",
								fontSize:7,
								cellWidth: 'wrap'
							},headerStyles: { fontStyle: 'Times',fontSize:7,cellWidth: 'wrap' },didParseCell:(data)=>{
          if(data.section=='head'&&data.row.index==0&&data.column.index==0){
            data.row.cells[0].colSpan=13;
            //description above refer to the column of the table on the lastrow
          }
					if((data.section=='head'&&data.cell.raw=='TB Năm')||(data.section=='head'&&data.cell.raw=='Học lực')||(data.section=='head'&&data.cell.raw=='Hạnh kiểm')||(data.section=='head'&&data.cell.raw=='Điểm UT')||(data.section=='head'&&data.cell.raw=='Điểm KK')||(data.section=='head'&&data.cell.raw=='Xếp loại TN')){
						data.row.cells[k].rowSpan=2;
						data.row.cells[k].minWidth=15;
						data.row.cells[k].styles.cellWidth=15;
						k++;
					}
        }
						});

doc.rect(30, 102, 70, 85, 'S');
//doc.output('dataurlnewwindow');
//doc.save("schedule " + $(".custMenuHilite").textContent + " " + selectedDate.toLocaleDateString() + ".pdf");
			 //var doc2=new jsPDF();
			 // var data = [];
			 // for (var insert = 0; insert <= 50; insert++) {
				//  data.push({
				// 	 "name" : "jspdf plugin",
				// 	 "version" : insert,
				// 	 "author" : "Prashanth Nelli",
				// 	 "Designation" : "jspdf table plugin"
				//  });
			 // }
			 // var height = doc.drawTable(data, {
				//  xstart : 10,
				//  ystart : 10,
				//  tablestart : 40,
				//  marginright :100,
				//  xOffset : 10,
				//  yOffset : 10,
				//  columnWidths:[100,50,200,200]
			 // });
			 // doc.text(50, height + 20, 'hi world');
			 // doc.autoTable(col,rows,{margin: { top: 50, left: 20, right: 20, bottom: 0 },headerStyles: {
			 //
       //      textColor: [0, 0, 0],
       //      halign: 'center'
       //  }});
			//  doc.autoTable({
			//          html: '#tbl',
			//
			// 				 styles: {
      //   cellPadding: 3,
      //   fontSize: 9,
      //   rowHeight: 15
      // }
			//      });
//doc.printingHeaderRow = false;
// 			 doc.autoTable({head:[['Silvio', 'Santos','abc']],
//                 body:[['sss', 'ttt','xyz']],createdCell(cell) {
//   if (cell.row.index === 0) {
//     cell.cell.styles.textColor = '#ffff';
//     cell.cell.styles.fillColor = '#ffff';
//     console.log(cell.cell.raw);
//   }
// },
// theme:'grid'
//   });
cong=410;

doc.rect(0, 420, 600, 0.5, 'S');

var cngang_ubnd=50;
var cdoc_ubnd=30+cong;

var cngang_chxh=300;
var cdoc_chxh=30+cong;

var cngang_dltd=325;
var cdoc_dltd=40+cong;

//var cngang_truong=50;
var cdoc_truong=40+cong;

var cngang_vb=30;
var cdoc_vb=90+cong;

var cngang_cntn=150;
var cdoc_cntn=90+cong;

var cngang_cc=110;
var cdoc_cc=110+cong;

var cngang_ht=110;
var cdoc_ht=125+cong;

var cngang_cn=110;
var cdoc_cn=140+cong;

var cngang_gt=300;
var cdoc_gt=140+cong;

var cngang_dt=400;
var cdoc_dt=140+cong;

var cngang_ngs=110;
var cdoc_ngs=155+cong;

var cngang_ns=300;
var cdoc_ns=155+cong;

var cngang_lop=110;
var cdoc_lop=170+cong;

var cngang_nh=300;
var cdoc_nh=170+cong;

var cngang_dcn=110;
var cdoc_dcn=185+cong;

var cngang_ldc=70;
var cdoc_ldc=275+cong;

var cngang_dtt=70;
var cdoc_dtt=290+cong;

var cngang_nv1=70;
var cdoc_nv1=305+cong;

//var cngang_nv2=250;
var cdoc_nv2=305+cong;

//var cngang_bth=400;
var cdoc_bth=330+cong;

var cngang_htt=450;
var cdoc_htt=345+cong;

//var cngang_htk=440;
var cdoc_htk=400+cong;

var cngang_ly=30;
var cdoc_ly=380+cong;

var cngang_ncc=30;
var cdoc_ncc=395+cong;

var cngang_gnc=30;
var cdoc_gnc=405+cong;


doc.setFont("Times");
doc.setFontType("bold");
doc.setFontSize(10);
doc.text(ubnd, cngang_ubnd, cdoc_ubnd, 0);
doc.text("Cộng Hòa Xã Hội Chủ Nghĩa Việt Nam", cngang_chxh, cdoc_chxh, 0);
doc.text("Độc lập - Tự do - Hạnh phúc", cngang_dltd, cdoc_dltd, 0);
doc.setFillColor(0,0,0);
doc.rect(325, 42+cong, 122, 0.5, 'F');
doc.text("Trường "+truong, cngang_truong, cdoc_truong, 0);
doc.setFont("Times");
doc.setFontType("bold");
doc.setFontSize(12);
doc.text("GIẤY CHỨNG NHẬN TỐT NGHIỆP TRUNG HỌC CƠ SỞ (Tạm thời)", cngang_cntn, cdoc_cntn, 0);
doc.setFont("Times");
doc.setFontType("normal");
doc.setFontSize(10);
doc.text("Số VB: "+sovb, cngang_vb, cdoc_vb, 0);
doc.text(quyetdinh, cngang_cc, cdoc_cc, 0);
doc.text("Hiệu trưởng trường: "+truong, cngang_ht, cdoc_ht, 0);
doc.text("Chứng nhận: "+hoten, cngang_cn, cdoc_cn, 0);
doc.text("Giới tính: "+gioitinh, cngang_gt, cdoc_gt, 0);
doc.text("Dân tộc: "+dantoc, cngang_dt, cdoc_dt, 0);
doc.text("Ngày sinh: "+ngaysinh, cngang_ngs, cdoc_ngs, 0);
doc.text("Nơi sinh: "+noisinh, cngang_ns, cdoc_ns, 0);
doc.text("Học sinh lớp: "+lop, cngang_lop, cdoc_lop, 0);
doc.text("Năm học: "+namhoc, cngang_nh, cdoc_nh, 0);
doc.text("Được công nhận tốt nghiệp Trung học cơ sở khóa ngày: "+khoangay, cngang_dcn, cdoc_dcn, 0);
doc.setFont("Times");
doc.setFontType("normal");
doc.setFontSize(10);
doc.text("Lý do có điểm ưu tiên, khuyến khích: "+gc, cngang_ldc, cdoc_ldc, 0);
doc.text("Dự thi tuyển sinh lớp 10 trường THPT ban: "+ban, cngang_dtt, cdoc_dtt, 0);
doc.text("Nguyện vọng 1: "+nv1, cngang_nv1, cdoc_nv1, 0);
doc.text("Nguyện vọng 2: "+nv2, cngang_nv2, cdoc_nv2, 0);
doc.setFont("Times");
doc.setFontType("italic");
doc.setFontSize(10);
doc.text(huyen+", ngày "+ngay+" tháng "+thang+" năm 2019", cngang_bth, cdoc_bth, 0);
doc.setFont("Times");
doc.setFontType("bold");
doc.setFontSize(10);
doc.text("Hiệu trưởng", cngang_htt, cdoc_htt, 0);
doc.text(hieutruong, cngang_htk, cdoc_htk, 0);
doc.text("Lưu ý:", cngang_ly, cdoc_ly, 0);
doc.setFont("Times");
doc.setFontType("italic");
doc.setFontSize(7);
doc.text("- Nếu có chi tiết sai, phải báo ngay cho trường THCS biết để điều chỉnh", cngang_ncc, cdoc_ncc, 0);
doc.text("- giấy này có giá trị trong vòng 12 tháng kể từ ngày ký", cngang_gnc, cdoc_gnc, 0);

var k=13;

doc.autoTable({head:[['Kết quả các môn học lớp 9','TB Năm','Học lực','Hạnh kiểm','Điểm UT','Điểm KK','Xếp loại TN'],['Toán','Lí','Hóa','Sinh','Văn','Sử','Địa','NN','GDCD','C.nghệ','TD','Nhạc','M.thuật']],body:[[toan,li,hoa,sinh,van,su,dia,anh,gdcd,cn,td,nhac,mt,tb,hl,hk,ut,kk,xl]],
	theme: 'plain',
	startY: 200+cong,
	styles: { // Defaul style
		lineWidth: 0.01,
		lineColor: 0,
		fillStyle: 'DF',
		halign: 'center',
		valign: 'middle',
		columnWidth: '15',
		overflow: 'linebreak',
		font: "Times",
		fontSize:7,
		cellWidth: 'wrap'
	},headerStyles: { fontStyle: 'Times',fontSize:7,cellWidth: 'wrap' },didParseCell:(data)=>{
if(data.section=='head'&&data.row.index==0&&data.column.index==0){
data.row.cells[0].colSpan=13;
//description above refer to the column of the table on the lastrow
}
if((data.section=='head'&&data.cell.raw=='TB Năm')||(data.section=='head'&&data.cell.raw=='Học lực')||(data.section=='head'&&data.cell.raw=='Hạnh kiểm')||(data.section=='head'&&data.cell.raw=='Điểm UT')||(data.section=='head'&&data.cell.raw=='Điểm KK')||(data.section=='head'&&data.cell.raw=='Xếp loại TN')){
data.row.cells[k].rowSpan=2;
data.row.cells[k].minWidth=15;
data.row.cells[k].styles.cellWidth=15;
k++;
}
}
});

doc.rect(30, 102+cong, 70, 85, 'S');

						if(gg.length-i>1)
							doc.addPage('a4','p');
					};
				}
				if (typeof doc !== 'undefined') try {
					////////////////////////////////


					////////////////////////////////
					if (navigator.appVersion.indexOf("MSIE") !== -1 || navigator.appVersion.indexOf("Edge") !== -1 || navigator.appVersion.indexOf('Trident') !== -1) {
						var options = {
							pdfOpenParams: {
								navpanes: 0,
								toolbar: 0,
								statusbar: 0,
								view: "FitV"
							},
							forcePDFJS: true,
							PDFJS_URL: 'examples/PDF.js/web/viewer.html'
						};
						PDFObject.embed(doc.output('bloburl'), "#preview-pane", options);
					} else {


						PDFObject.embed(doc.output('datauristring'), "#preview-pane");
					}
				} catch (e) {
					alert('Error ' + e);
				}
			}, 0);

		}
	};

}();

// $(document).ready(function () {
	// jsPDFEditor.init();
// });
