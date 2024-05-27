<?php
/**
 * @license MIT
 *
 * Modified by Taylor Lovett on 27-May-2024 using Strauss.
 * @see https://github.com/BrianHenryIE/strauss
 */

namespace ElasticPress\Vendor_Prefixed\Composer\Installers;

class DokuWikiInstaller extends BaseInstaller
{
    /** @var array<string, string> */
    protected $locations = array(
        'plugin' => 'lib/plugins/{$name}/',
        'template' => 'lib/tpl/{$name}/',
    );

    /**
     * Format package name.
     *
     * For package type dokuwiki-plugin, cut off a trailing '-plugin',
     * or leading dokuwiki_ if present.
     *
     * For package type dokuwiki-template, cut off a trailing '-template' if present.
     */
    public function inflectPackageVars(array $vars): array
    {
        if ($vars['type'] === 'dokuwiki-plugin') {
            return $this->inflectPluginVars($vars);
        }

        if ($vars['type'] === 'dokuwiki-template') {
            return $this->inflectTemplateVars($vars);
        }

        return $vars;
    }

    /**
     * @param array<string, string> $vars
     * @return array<string, string>
     */
    protected function inflectPluginVars(array $vars): array
    {
        $vars['name'] = $this->pregReplace('/-plugin$/', '', $vars['name']);
        $vars['name'] = $this->pregReplace('/^dokuwiki_?-?/', '', $vars['name']);

        return $vars;
    }

    /**
     * @param array<string, string> $vars
     * @return array<string, string>
     */
    protected function inflectTemplateVars(array $vars): array
    {
        $vars['name'] = $this->pregReplace('/-template$/', '', $vars['name']);
        $vars['name'] = $this->pregReplace('/^dokuwiki_?-?/', '', $vars['name']);

        return $vars;
    }
}
