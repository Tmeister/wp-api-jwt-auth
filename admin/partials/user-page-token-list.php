<h3>JWT - Tokens</h3>
<table class="wp-list-table widefat plugins">
    <thead>
    <tr>
        <th scope="col" id="jwt-token" class="manage-column column-name column-primary">Token UUID</th>
        <th scope="col" id="jwt-user-agent" class="manage-column column-user-agent">User Agent</th>
        <th scope="col" id="jwt-created" class="manage-column column-created">Created on</th>
        <th scope="col" id="jwt-actions" class="manage-column column-actions">Actions</th>
    </tr>
    </thead>

    <tbody id="the-list">
    <?php foreach ($user_tokens as $token): ?>
        <?php $user_agent = get_post_meta($token->ID, 'jwt_user_agent', true); ?>
        <tr class="jwt-token-holder inactive" id="<?php echo $token->ID;?>">
            <td class="plugin-title column-primary">
                <strong><?php echo esc_html($token->post_title); ?></strong>
            </td>
            <td class="column-user-agent desc">
                <div class="column-user-agent">
                    <p><?php echo esc_html($user_agent) ?></p>
                </div>
            </td>
            <td class="column-created-on">
                <div class="column-actions">
                    <p><?php echo $token->post_date ?></p>
                </div>
            </td>
            <td class="column-actions">
                <div class="column-actions"><p><a class="removetoken" data-tokenpostid="<?php echo $token->ID;?>" style="cursor:pointer;">Delete token</a></p></div>
            </td>
        </tr>
    <?php endforeach; ?>
    </tbody>


</table>
<script>
jQuery('.removetoken').on('click',function() {
    var tokenpostid = jQuery(this).data( "tokenpostid" );
        ajaxurl = "<?php echo admin_url( 'admin-ajax.php' ); ?>";

        var data = {
            'action': 'deltoken',
            'security': '<?php echo wp_create_nonce( "deltoken" ); ?>',
            'tokenpostid': tokenpostid,
        };
        jQuery.post(ajaxurl, data, function(response) {
            json = jQuery.parseJSON(response);
            if (json == tokenpostid) {
            jQuery('#'+tokenpostid).remove();
            }
            //console.log(json);
        });
        });
         </script>