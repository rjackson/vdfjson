$('button#vdfjson_submit').click(function(e){
    e.preventDefault();

    // Get data and format
    var $data = $('textarea[name="data"]'),
        format = $('input[name="format"]:checked').val();


    if (format == 'vdf')
    {
        $data.val(JSON.stringify(VDF.parse($data.val()), null, 4));
        $('input[value="json"]').prop('checked', true);

    }
    else if (format == 'json')
    {
        $data.val(VDF.dump(JSON.parse($data.val())));
        $('input[value="vdf"]').prop('checked', true);
    }
});
