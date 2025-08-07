$('h4.name').each(function(){
  var toc = $(this)
      id = toc.attr('id'),
      href = "#" + id,
  anchor = '<a class="anchor" href="'+href+'"></a>'

  toc.prepend(anchor)
})
