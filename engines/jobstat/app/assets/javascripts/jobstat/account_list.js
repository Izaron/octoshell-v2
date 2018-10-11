$(document).ready(function() {
  $("#jobs").tablesorter({
    //debug: true,
    duplicateSpan: false,
    emptyTo: 'bottom',
    widgets: ['staticRow'],
    //theme: 'default',
    textExtraction: {
      //0: function(node, table, cellIndex) { return $(node).find("strong").text(); },
      '.rank': function(node, table, cellIndex) {
        return $(node).find("i").attr('data-stars')
          /*var x=$(node).find("i").attr('data-stars');
          console.log("!"+x);
          return x;*/
      },
    },
    textSorter: {
      '.triplesort': function(a, b, direction, column, table) {
        // this is the original sort method from tablesorter 2.0.3
        var item = $(table).attr('data-triple-sort')
        if (typeof(item) === 'undefined') {
          console.log("Warning! No data-triple-sort specified...")
          item = '0'
        } else {
          item = parseInt(item)
        }
        // format data for normalization
        var x = parseFloat(a.split('/')[item])
        var y = parseFloat(b.split('/')[item])
          //console.log("sorting-by: "+item+"a="+a+" b="+b+" x="+x+" y="+y)
        return ((x < y) ? -1 : ((x > y) ? 1 : 0));
      },
    },
  });

  $(".sorting").click(function() {
    var $t = $(this),
      col = $t.attr('data-column'),
      dir = $t.attr('data-direction'),
      item = $t.attr('data-item');
    $('#jobs').attr('data-triple-sort', item)
      // sort column in set direction
    $("#jobs").find("th:contains(corehours)").trigger('sorton', [
      [
        [col, dir]
      ]
    ]);
    // update to current data-direction
    $t.attr('data-direction', (parseInt(dir, 10) + 1) % 2);
    return false;
  });

  function silent_submit(response) {
    console.log(response)
  }

  function submit_and_reload(response) {
    console.log(response)
    location.reload()
  }

  $("#feedback_job_rule").submit(function() {
    $.post($(this).attr('action'), $(this).serialize(), silent_submit)
    return false
  })
  $("#feedback_jobs").submit(function() {
    $.post($(this).attr('action'), $(this).serialize(), silent_submit)
    return false
  })
  $("#feedback_rule").submit(function() {
    $.post($(this).attr('action'), $(this).serialize(), submit_and_reload)
    return false
  })

});


var feedback_started = false;

function toggle_dropdown(target) {
  $(target).toggleClass('show');
}

// open/close new div after job row
function process_response(index, jobid) {
  var row = $("#job_row_" + index);
  var info_row = $("#job_info_" + index);
  if (row.attr('data-info-state') == '-1') {
    return
  }
  if (row.attr('data-info-state') == '0') {
    // open it!
    row.attr('data-info-state', '1');
    //$(info_row).removeClass("hidden_box");
    $(info_row).show();
  } else {
    // close it!
    row.attr('data-info-state', '0');
    //$(info_row).addClass("hidden_box");
    $(info_row).hide();
  }
  //$(info_row).toggleClass("hidden_box");
}

function popup_show(a, b) {
  //$("#popup_" + a).addClass('active')
  $("#popup_" + a).addClass('target')
  $("#" + b).val('')
  $("#" + b).focus()
  return false;
}

function popup_hide(a, b) {
  //$("#popup_" + a).removeClass('active')
  $("#popup_" + a).removeClass('target')
  return false;
}

// user disagrees with rule
function disagree(jobid, rule, text) {
  var feedback={
    user: current_user,
    cluster: jobs[jobid]['cluster'],
    //job_id: jobid,
    //task_id: 0,
    account: jobs[jobid]['login'],
    condition: rule,
    feedback: text ? text : $("#question_" + jobid + '_' + rule).val(),
  }
  $.ajax({
    type: "POST",
    url: "feedback",
    data: {'feedback': feedback, 'type': 'feedback_rule'},
  }).always(function( msg ) {
    restore_disagree_button()
    jobs[jobid]['feedback'][rule]={'class': 1}
    update_jobs_agree('')
  });
}

// user agrees with rule
function agree(jobid, rule, text) {
  var feedback={
    user: current_user,
    cluster: jobs[jobid]['cluster'],
    //job_id: jobid,
    //task_id: 0,
    account: jobs[jobid]['login'],
    condition: rule,
    feedback: text ? text : $("#question_" + jobid + '_' + rule).val(),
  }
  $.ajax({
    type: "POST",
    url: "feedback",
    data: {'feedback': feedback, 'type': 'feedback_rule'},
  }).always(function( msg ) {
    restore_disagree_button()
    jobs[jobid]['feedback'][rule]={'class': 0}
    update_jobs_agree('')
  });
}

function hide_rule_on_page(rule) {
  $(".cond-div").each(function(div){
    if($(this).attr("data-rule-div")==rule) {
      $(this).removeClass("visible")
      $(this).addClass("hidden")
    }
  })
}

function hide_rule(jobid, rule) {
  var feedback={
    user: current_user,
    cluster: jobs[jobid]['cluster'],
    // job_id: jobid,
    // task_id: 0,
    condition: rule,
    account: jobs[jobid]['login'],
    feedback: $("#question_hide" + jobid + '_' + rule).val(),
  }
  $.ajax({
    type: "POST",
    url: "feedback",
    data: {'feedback': feedback, 'type': 'hide_rule'},
  }).done(function( msg ) {
    restore_disagree_button()
    //update_jobs_agree(feedback)
  }).fail(function( msg ) {
    restore_disagree_button()
    //update_jobs_agree(feedback)
  });
  hide_rule_on_page(rule)
}

function intersection(o1, o2) {
  return Object.keys(o1).filter({}.hasOwnProperty.bind(o2));
}

// when job_check (un)checked
function job_check_clicked(jobid){
  var first=true
  var rules={}
  var rules_text=''
  $(".job_check").each(function(){
    if(this.checked==false)
      return
    var jid=$(this).attr('data-job-id')
    if(first){
      rules={}
      //copy rules from first job
      for(var r in jobs[jid]['rules']){
        rules[r]=jobs[jid]['rules'][r]
      }
      first=false
    }
    else{
      //delete rules missed in other selected jobs
      Object.keys(rules).forEach(function(k){
        if(!(k in jobs[jid]['rules']))
          delete rules[k]
      })
    }
  })
  for(r in rules){
    rules_text+="<input type='checkbox' class='disagree_checkbox' data-rule='"+r+"''>"+rules[r]+"</input><br/>"
  }
  if(rules_text==''){
    rules_text='Нет общих правил!!!'
    $('#disagree_button').attr('disabled', true);
  }
  else{
    $('#disagree_button').attr('disabled', false);
  }
  $("#disagree_rules").html(rules_text)
}

// feedback on "O! I disagree with my tasks valuation!"
function multi_job_feedback() {
  // Just start feedback, do preparations
  if (feedback_started == false) {
    var row, c, jobid;
    feedback_started = true;
    // Just prepare feedback - show checkboxes
    $(".job_check").prop('checked',false)
    $(".job_check").show()

    $('#disagree_reason_box').css({
      display: 'inline',
    }).animate();

    $('#disagree_reason').focus()
    $('#disagree_reason').val('')
  
    $('#disagree_button').text('Отметьте нужные задания и отправьте отзыв').attr('disabled', true);
  } else {
    // all selected, send data!
    var job_list = [];
    var rule_list = [];
    var delimiter = ''
    $('.job_check').each(function(_, el) {
      var e = $(el)
      if (e.prop('checked')) {
        job_list.push(e.attr('data-job-id'))
      }
    })
    
    $('.disagree_checkbox').each(function (_,el) {
      var e = $(el)
      if (e.prop('checked')) {
        rule_list.push(e.attr('data-rule'))
      }
    })

    var feedback=[]
    job_list.forEach(function(id){
      rule_list.forEach(function(rule){
        feedback.push({
          'user': current_user,
          'cluster': jobs[id]['cluster'],
          'job_id': id,
          'condition': rule,
          'task_id': 0,
          'class': 1,
          'feedback': $("#disagree_reason").val(),
        })
        if(!jobs[id]['feedback']){
          jobs[id]['feedback']={}
        }
        jobs[id]['feedback'][rule]={'class': 1}
      })
    })
   

    $('#disagree_button').text('Отправляем...');
    $('#disagree_button').prop('disabled', true);
    feedback_started = false;
    $.ajax({
      type: "POST",
      url: "feedback",
      data: {'feedback': feedback, 'type': 'multi_jobs'},
    }).done(function( msg ) {
      restore_disagree_button()
      update_jobs_agree(feedback)
    }).fail(function( msg ) {
      restore_disagree_button()
      update_jobs_agree(feedback)
    });
  }
}

function restore_disagree_button() {
    $('#disagree_reason_box').css({
      display: 'none'
    }).animate();

    // Now delete checkboxes
    $(".job_check").hide()
    $('#disagree_button').text('Жмите тут!');
    $('#disagree_button').prop('disabled', false);
}

function agree_all() {
  var new_feedback=[]
  for (var id in jobs) {
    // search jobs without feedback yet
    var current_feed
    if ('feedback' in jobs[id]) {
      //  job has feedback
      current_feed=jobs[id]['feedback']
    } else {
      current_feed={}
      jobs[id]['feedback']={}
    }
    for(var rule in jobs[id]['rules']){
      if(!(rule in current_feed)){
        new_feedback.push({
          'user': current_user,
          'cluster': jobs[id]['cluster'],
          'job_id': id,
          'condition': rule,
          'task_id': 0,
          'class': 0,
          'feedback': 'ok!'
        })
        jobs[id]['feedback'][rule]={'class': 0}
      }
    }
  }

  //$('#agree_all').prop('disabled', true);

  $.ajax({
    type: "POST",
    url: "feedback",
    data: {'feedback': new_feedback, 'type': 'multi_jobs'},
  }).done(function( msg ) {
    update_jobs_agree(new_feedback)
  }).fail(function( msg ) {
    update_jobs_agree(new_feedback)
  });
}

function update_jobs_agree(feedback){
  $('.disagree-button').prop('disabled', false);
  for(var job in jobs){
    if(jobs[job]['feedback']){
      for(var rule in jobs[job]['feedback']){
        var c=(parseInt(jobs[job]['feedback'][rule]['class'])==0)? 0 : 1

        var id='#af-'+job+'-'+rule
        $(id).attr('class','agreed-flag') // reset other classes
        $(id).addClass(agree_flags[c])
      }
    }
  }


/*
  feedback.forEach(function(item){
    item['job_id'].forEach(function(job) {
      if(!('feedback' in jobs[job])){
        jobs[job['feedback']]={}
      }
      item['condition'].forEach(function(rule){
        var id='#af-'+job+'-'+rule
        $(id).attr('class','agreed-flag') // reset other classes
        if(item['class']==0) {
          $(id).addClass(agree_flags[0])
          jobs[id]['feedback'][rule]={'class':0}
        }
        else {
          $(id).addClass(agree_flags[1])
          jobs[id]['feedback'][rule]={'class':1}
        }
      })
    })
  })
  */
 }

function show_thanks(text){
  var time_to_show=2000;

  if(!text) {
    text="Спасибо за отзыв!"
  }

  $('#thanks_box').addClass('active');
  setTimeout("$('#thanks_box').removeClass('active');",time_to_show);
}