<?php
/**
 * @license MIT
 *
 * Modified by Taylor Lovett on 27-May-2024 using Strauss.
 * @see https://github.com/BrianHenryIE/strauss
 */

namespace ElasticPress\Vendor_Prefixed\Composer\Installers;

class LaravelInstaller extends BaseInstaller
{
    /** @var array<string, string> */
    protected $locations = array(
        'library' => 'libraries/{$name}/',
    );
}
