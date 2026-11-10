<script lang="ts">
import { Accordion } from '@sivir-ui/svelte';
import { principles } from './data.ts';
import { quietLink, skillUrl } from './repo.ts';
</script>

<Accordion.Root type="multiple">
  {#each principles as [group, list] (group)}
    <Accordion.Item value={group}>
      <Accordion.Trigger>{group} · {list.length}</Accordion.Trigger>
      <Accordion.Content>
        <dl class="space-y-2.5 pb-2">
          {#each list as [name, what] (name)}
            <div>
              <dt>
                <a class={quietLink} href={skillUrl(`principle-${name}`)}>
                  <code class="font-mono text-[13px]">{name}</code>
                </a>
              </dt>
              <dd class="text-foreground-muted">{what}</dd>
            </div>
          {/each}
        </dl>
      </Accordion.Content>
    </Accordion.Item>
  {/each}
</Accordion.Root>
