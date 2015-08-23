var lineCounter;
var startIndex;
var endIndex;
var summaries;

var startBound = $('<div/>').attr('draggable', 'true').on('dragstart', function(ev) {
  //console.log(ev);
  //$(document).bind('mousemove', function(ev) {
  //  console.log('move');
  //});
}).on('dragend', function(ev) {
  //console.log('done');
  //$(document).unbind('mousemove');
}).addClass('bound start-bound').text('start');
var endBound = $('<div/>').addClass('bound end-bound').text('end');

var parseText = function(input, output) {
  input = JSON.parse(input)["裁判全文"];
  lineCounter = 0;
  output.html('');
  summaries = [];
  $('#json-box').show();
  $(output).bind('mouseup', function() {
    //console.log(new Date());
    var selection;
    if (window.getSelection) {
      selection = window.getSelection();
    } else if (document.selection) {
      selection = document.selection.createRange();
    }
    if (selection.toString() !== '') {
      startBound.detach();
      endBound.detach();
      var elements = [
        $(selection.anchorNode.parentElement.parentElement.parentElement),
        $(selection.extentNode.parentElement.parentElement.parentElement),
      ];
      elements.sort(function(a, b) { return b.attr('data-line-number')-a.attr('data-line-number')});
      var startEl = elements.pop();
      var endEl = elements.pop();
      startEl.before(startBound);
      endEl.after(endBound);
      
      startIndex = parseInt(startEl.attr('data-line-number'));
      endIndex = parseInt(endEl.attr('data-line-number'));
      console.log('Line Start: ' + startIndex);
      console.log('Line End: ' + endIndex);
      window.hl = $('.line').slice(startIndex, endIndex+1);
      $('.selected-line').removeClass('selected-line');
      $(window.hl).addClass('selected-line');
      //$(selection.anchorNode.parentElement.parentElement.parentElement).before(startBound);
      //$(selection.focusNode.parentElement.parentElement.parentElement).after(endBound);
      //selection.empty();
      window.selection = selection;
      $('#submit-form').show();
    }
  });
  $('#submit').click(function() {
    var title = $('#title').val();
    var summary = $('#summary').val();
    if (title.length > 0 && summary.length > 0) {
      summaries.push({
        "line_start": startIndex,
        "line_end": endIndex,
        "title": title,
        "summary": summary
      });
    } else {
    }
    if (summaries.length > 0) {
      console.log(JSON.stringify(summaries));
      $('#json-text').val(JSON.stringify(summaries));
      importHighlight(summaries);
    }
    startBound.detach();
    endBound.detach();
  });
  $('#import-json').click(function() {
    var json = $('#json-text').val();
    if (json.length > 0) {
      summaries = JSON.parse(json);
      importHighlight(summaries);
    }
    startBound.detach();
    endBound.detach();
  });
  window.input = input;
  var lines = input.split(/\n/);
  window.lines = lines;
  var ch_num = ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十'];
  var h1i = 0;
  var h2i;
  $.each(lines, function(i, line) {
    var h1pattern = '^' + ch_num[h1i] + '、.*';
    var h2pattern = '[(（]' + ch_num[h2i] + '[)）].*';
    if (line.match(/^\s+主\s*文\s*$/)) {
      renderLine(output, 'header-main', line);
    } else if (line.match(h1pattern)) {
      renderLine(output, 'header1', line);
      h1i++;
      h2i = 0;
    } else if (line.match(h2pattern)) {
      renderLine(output, 'header2', line);
      h2i++;
    } else if (line.match(/^\s{4}[^\s].*/)) {
      //renderLine(output, 'content-s4', line);
      renderLine(output, '', line);
    } else if (line.match(/^\s{6}[^\s].*/)) {
      //renderLine(output, 'content-s6', line);
      renderLine(output, '', line);
    } else {
      renderLine(output, '', line);
    }
  });
  $('.line-number').css('width', lineCounter.toString().length * 10 + 'px');
}

var renderLine = function(output, type, line) {
  var div = $('<div></div>').addClass('line').attr('data-line-number', lineCounter);
  var label = $('<label></label>');
  //var cb = $('<input/>').attr('type', 'checkbox').addClass('cb');
  var number = $('<span></span>').addClass('line-number').text(lineCounter);
  var text = $('<span></span>').addClass('content ' + type).text(line);
  //label.append(cb);
  label.append(number);
  label.append(text);
  div.append(label);
  output.append(div);
  lineCounter++;
}
var importHighlight = function(json_array) {
  $('.line').removeClass('marked');
  $('.marked-split').remove();
  $('.summary-box').remove();
  $.each(json_array, function(i, json) {
    var lines = $('.line').slice(json.line_start, json.line_end + 1).addClass('marked');
    var summaryBox = $('<div></div>').addClass('summary-box');
    //var title = $('<div></div>').addClass('box-title').text('標題：' + json.title);
    //var summary = $('<div></div>').addClass('box-summary').text('摘要：' + json.summary);
    var summary = $('<div></div>').addClass('box-summary').html('標題：' + json.title + '<br>' + '摘要：' + json.summary);
    //summaryBox.append(title);
    summaryBox.append(summary);
    lines.last().after(summaryBox);
    lines.last().after($('<div></div>').addClass('marked-split'));
  });
}
